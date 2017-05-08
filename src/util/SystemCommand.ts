'use strict';

import {window, workspace, OutputChannel, Terminal} from 'vscode';
import {BluemixTerminal} from './BluemixTerminal';
import {CommandDetection} from './CommandDetection';

const spawn = require('child_process').spawn;
const psTree = require('ps-tree');


/*
 * Class to execute system commands
 */
export class SystemCommand {
    command: string;
    args: string[];
    invocation: any;
    outputChannel: OutputChannel;
    sanitizeOutput: boolean = false;
    stdout: string = '';
    stderr: string = '';


    // TECH DEBT: Two methods exist for invoking system commands
    //   1: invoke internally and display stdout and stderr in output panel (CURRENT IMPLEMENTATION)
    //   2: invoke within embedded terminal
    //
    // There are pros and cons to each approach.
    // Terminal feels really nice, but there are concurrency issues.  EX: if you run bx dev debug,
    // it takes over the terminal, and you can't invoke anything else until that process exits
    //
    // Toggle between the two using this static var
    private static useTerminal = false;


    /*
     * Constructor
     * @param {string} command to be executed
     * @param {string[]} array of additional arguments
     * @param {OutputChannel} output channel to display system process output
     */
    constructor(public _command: string, public _args: string[] = [], public _outputChannel: OutputChannel = undefined, sanitizeOutput: boolean = false) {
        this.command = _command;
        this.args = _args;
        this.outputChannel = _outputChannel;
        this.sanitizeOutput = sanitizeOutput;

        if (this.outputChannel !== undefined) {
            this.outputChannel.show();
        }
    }

    /*
     * Is the command active
     * @returns {boolean} Returns active status
     */
    isActive() {
        return (this.command !== undefined);
    }

    /*
     * Destroy references in this class to prevent memory leaks
     */
    destroy() {
        this.command = undefined;
        this.args = undefined;
        this.outputChannel = undefined;
        this.invocation = undefined;
        this.stdout = undefined;
        this.stderr = undefined;
    }

    /*
     * Execute the commmand
     */
    execute(): Promise<any> {
        if (SystemCommand.useTerminal)
            return this.executeWithTerminal();
        else
            return this.executeWithOutputChannel();
    }

    /*
     * Execution implementation with VS Code's embedded terminal
     */
    executeWithTerminal(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const terminal = BluemixTerminal.instance;
            terminal.sendText(`${this.command} ${this.args.join(' ')}\n`);
            terminal.show();
            resolve('OK: sent to terminal');
        });
    }

    /*
     * Execution implementation with spawned process & output channels
     */
    executeWithOutputChannel(): Promise<any> {
        const promise = new Promise<any>((resolve, reject) => {

            // only check if we're in a folder if not running a unit test
            // (output channel will not be defined in unit test)
            if (workspace.rootPath === undefined && this.outputChannel !== undefined) {
                const message = 'Please select your project\'s working directory.';
                this.output(`\nERROR: ${message}`);
                window.showErrorMessage(message);
                return;
            }

            this.output(`\n\n> ${this.command} ${this.args.join(' ')}\n`);

            this.stdout = '';
            this.stderr = '';

            const opt = {
                cwd: workspace.rootPath,
            };
            this.invocation = spawn(this.command, this.args, opt);

            let buffer;

            this.invocation.stdout.on('data', (data) => {

                // if we're sanitizing the output, keep it all in a buffer until complete
                // otherwise just write it out
                if (this.sanitizeOutput) {
                    this.output('.');

                    if (buffer === undefined) {
                        buffer = data;
                    }
                    else {
                        const oldBuffer = buffer;
                        buffer = new (buffer.constructor)( oldBuffer.length + data.length);
                        buffer;
                        for (let x = 0; x < oldBuffer.length; x++) {
                            buffer[x] = oldBuffer[x];
                        }
                        for (let y = 0; y < data.length; y++) {
                            buffer[oldBuffer.length + y] = data[y];
                        }
                    }
                }
                else {
                    this.output(data.toString());
                    this.stdout += data.toString();
                }
            });

            this.invocation.stderr.on('data', (data) => {
                this.output(`${data}`);
                this.stderr += data.toString();
            });

            this.invocation.on('close', (code, signal) => {
                this.output(`\n`);

                if (this.sanitizeOutput) {
                    const stringOutput = this.sanitizeBuffer(buffer).toString();
                    this.output(stringOutput);
                    this.stdout = stringOutput;
                    buffer = undefined;
                }

                const condition = CommandDetection.determineErrorCondition(code, this.stdout, this.stderr);

                if (condition === CommandDetection.ERR_COMMAND_NOT_FOUND || condition === CommandDetection.ERR_PLUGIN_NOT_FOUND) {
                    let errorDetail = '';
                    switch (condition) {
                        case CommandDetection.ERR_COMMAND_NOT_FOUND:
                            errorDetail = `Unable to locate '${this.command}' command.`;
                            break;
                        case CommandDetection.ERR_PLUGIN_NOT_FOUND:
                            errorDetail = `Unable to locate '${this.command}' '${this.args[0]}' plugin.`;
                            break;
                    }
                    window.showErrorMessage(errorDetail);

                    errorDetail += '\nFor additional detail, please see https://console.ng.bluemix.net/docs/cli/reference/bluemix_cli/index.html#getting-started';
                    this.output(errorDetail);
                }
                resolve(code);

                // add this at the end of the promise chain, so it gets called last, for certain.
                // this allos us to fulfill other steps in the promise chain, and clean everything up last
                const self = this;
                promise.then(function() {
                    self.destroy();
                });
            });

            this.invocation.on('error', (error) => {
                // do something with the error?
                // for now, ignore and let the 'close' event
                // take care of things with negative status code
            });
        });

        return promise;
    }


    /*
     * Sanitize the ChildProcess stdio output.
     * This takes into account ascii backspace and del characters
     * that the VSCode output channel doesn't handle by default.
     * @param {Buffer} unsanitized stdoio buffer
     * @returns {Buffer} sanitized buffer
     */
    private sanitizeBuffer(buffer) {

        // below contains a workaround for 16 bit integers being represented as 8 bit integers
        // from the Node ChildProcess stdio stream, which is causing errors on special unicode characters
        // as seen in 'bx dev list' - it will probably also happen in other places that
        // special characters are also used for cli loading animations

        let newLen = 0;
        for (let x = 0; x < buffer.length; x++) {
            const char = buffer[x];
            if (char === 8 || char === 127) {
                newLen --;
                newLen = Math.max(newLen, 0);
            }
            else {
                // workaround described above
                if (x > 0 && char === 160 && buffer[x - 1] === 226) {
                    newLen -= 2;
                }
                else
                    newLen ++;
            }
        }

        const outBuffer = new (buffer.constructor)(newLen);
        let i = 0;
        const lastNewline = 0;
        for (let x = 0; x < buffer.length; x++) {
            const char = buffer[x];
            if (char === 8 || char === 127) { // backspace and delete
                i --;
            } else {
                // workaround described above
                if (x > 0 && char === 160 && buffer[x - 1] === 226) {
                    i -= 2;
                }
                outBuffer[i] = char;
                i ++;
            }
            i = Math.max(i, 0);
        }

        return outBuffer;
    }

    /*
     * Display output in targeted output channel
     */
    output(data: any) {
        if (this.outputChannel !== undefined) {
            this.outputChannel.append(data);
        }
    }

    /*
     * Kill the process (spawned process only)
     */
    kill() {
        if (this.invocation !== undefined) {
            const self = this;
            const  signal = 'SIGKILL';
            psTree(self.invocation.pid, function (err, children) {
                [self.invocation.pid].concat(
                    children.map(function (p) {
                        return p.PID;
                    }),
                ).forEach(function (tpid) {
                    try {
                        self.output(`killing ${tpid}\n`);
                        process.kill(tpid, signal);
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                });
            });

            if (this.outputChannel !== undefined) {
                this.outputChannel.show();
            }
        }
    }
}
