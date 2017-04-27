'use strict';

import {window, workspace, OutputChannel, Terminal} from 'vscode';
import {BluemixTerminal} from './BluemixTerminal';

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
    constructor(public _command: string, public _args: string[] = [], public _outputChannel: OutputChannel = undefined,
    _additionalArgs: string[] = []) {
        this.command = _command;
        this.args = _args;
        this.outputChannel = _outputChannel;

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
        return new Promise<any>((resolve, reject) => {

            // only check if we're in a folder if not running a unit test
            // (output channel will not be defined in unit test)
            if (workspace.rootPath === undefined && this.outputChannel !== undefined) {
                const message = 'Please select your project\'s working directory.';
                this.output(`\n ERROR: ${message}`);
                window.showErrorMessage(message);
                return;
            }

            this.output(`\n> ${this.command} ${this.args.join(' ')}\n`);


            const opt = {
                cwd: workspace.rootPath,
            };
            this.invocation = spawn(this.command, this.args, opt);

            this.invocation.stdout.on('data', (data) => {
                this.output(`${data}`);
            });

            this.invocation.stderr.on('data', (data) => {
                this.output(`${data}`);
            });

            this.invocation.on('close', (code, signal) => {
                this.output(`\n`);
                this.destroy();
                if (code >= 0) {
                    resolve(code);
                }
                else {
                    reject(code);
                }
            });

            this.invocation.on('error', (error) => {
                // do something with the error?
                // for now, ignore and let the 'close' event
                // take care of things with negative status code
            });
        });
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
