/**
 * Copyright IBM Corporation 2016, 2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict';

import { window, workspace, OutputChannel } from 'vscode';
import { IBMCloudTerminal } from './IBMCloudTerminal';
import { CommandDetection } from './CommandDetection';
import { installPlugin } from '../ibmcloud/plugin';
import { CONFIRM_NO, CONFIRM_YES } from '../consts';

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
    sanitizeOutput = false;
    stdout = '';
    stderr = '';


    // TECH DEBT: Two methods exist for invoking system commands
    //   1: invoke internally and display stdout and stderr in output panel (CURRENT IMPLEMENTATION)
    //   2: invoke within embedded terminal
    //
    // There are pros and cons to each approach.
    // Terminal feels really nice, but there are concurrency issues.  EX: if you run ibmcloud dev debug,
    // it takes over the terminal, and you can't invoke anything else until that process exits
    //
    // Toggle between the two using this static var
    public useTerminal = false;


    /*
     * Constructor
     * @param {string} command to be executed
     * @param {string[]} array of additional arguments
     * @param {OutputChannel} output channel to display system process output
     */
    constructor(public _command: string, public _args: string[] = [], public _outputChannel: OutputChannel = undefined, sanitizeOutput = false) {
        this.command = _command;
        this.args = _args;
        this.outputChannel = _outputChannel;
        this.sanitizeOutput = sanitizeOutput;

        if (this.outputChannel) {
            // NOTE: Do not perserve focus (`preserveFocus`) when showing output channel to allow 
            // other UI components a chance to be in focus such as window.showInputBox and window.showQuickPick
            this.outputChannel.show(true);
        }
    }

    /*
     * Is the command active
     * @returns {boolean} Returns active status
     */
    isActive() {
        return !!this.command;
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
        if (this.useTerminal)
            return this.executeWithTerminal();
        else
            return this.executeWithOutputChannel();
    }

    /*
     * Execution implementation with VS Code's embedded terminal
     */
    executeWithTerminal(preserveFocus?: boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const terminal = IBMCloudTerminal.instance;
            terminal.sendText(`${this.command} ${this.args.join(' ')}\n`);
            terminal.show(preserveFocus);
            resolve('OK: sent to terminal');
        });
    }

    /*
     * Execution implementation with spawned process & output channels
     */
    executeWithOutputChannel(): Promise<any> {
        const self = this;
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

            const opt: any = {
                cwd: workspace.rootPath,
                env: {
                    ...process.env, IBMCLOUD_COLOR: false
                }
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
                        buffer = new (buffer.constructor)(oldBuffer.length + data.length);
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

                if (this.sanitizeOutput && buffer) {
                    const stringOutput = this.sanitizeBuffer(buffer).toString();
                    this.output(stringOutput);
                    this.stdout = stringOutput;
                    buffer = undefined;
                }

                const condition = CommandDetection.determineErrorCondition(code, this.stderr);

                if (condition === CommandDetection.ERR_COMMAND_NOT_FOUND || condition === CommandDetection.ERR_PLUGIN_NOT_FOUND) {
                    let errorDetail = '';
                    const pluginCmd = this.args[0];
                    const output = this.outputChannel;

                    // NOTE: Since we are using callback promises we need to use `bind` method to ensure that 
                    // we are using the original `this` context (via `self`) that called executeOuputChannel
                    const rerunCmd = this.executeWithOutputChannel.bind(self);

                    switch (condition) {
                        case CommandDetection.ERR_COMMAND_NOT_FOUND:
                            errorDetail = `Unable to locate '${this.command}' command.`;
                            break;
                        case CommandDetection.ERR_PLUGIN_NOT_FOUND:
                            errorDetail = `Unable to locate '${this.command}' '${this.args[0]}' plugin. Would you like to install '${this.args[0]}' and rerun the previous command?`;
                            // ask user if we should install the missing plugin and rerun the previous command
                            window.showQuickPick([CONFIRM_YES, CONFIRM_NO], { title: errorDetail })
                                .then((res: string) => {
                                    if (res === CONFIRM_YES) {
                                        installPlugin(pluginCmd, output)
                                            .then((status: number) => {
                                                if (status === 0) {
                                                    resolve(rerunCmd());
                                                }
                                                resolve(status);
                                            });
                                    }
                                });

                            break;
                    }

                    // Only print addition error messages for non plugin errors
                    if (condition != CommandDetection.ERR_PLUGIN_NOT_FOUND) {
                        errorDetail += '\nFor additional detail, please see https://cloud.ibm.com/docs/cli';
                        window.showErrorMessage(errorDetail);
                        this.output(errorDetail);

                        // add this at the end of the promise chain, so it gets called last, for certain.
                        // this allows us to fulfill other steps in the promise chain, and clean everything up last
                        promise.finally(function() {
                            self.destroy();
                        });
                    }
                }
                resolve(code);

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
        // as seen in 'ibmcloud dev list' - it will probably also happen in other places that
        // special characters are also used for cli loading animations

        let newLen = 0;
        for (let x = 0; x < buffer.length; x++) {
            const char = buffer[x];
            if (char === 8 || char === 127) {
                newLen--;
                newLen = Math.max(newLen, 0);
            }
            else {
                // workaround described above
                if (x > 0 && char === 160 && buffer[x - 1] === 226) {
                    newLen -= 1;
                }
                else
                    newLen++;
            }
        }

        const outBuffer = new (buffer.constructor)(newLen);
        let i = 0;
        const lastNewline = 0;
        for (let x = 0; x < buffer.length; x++) {
            const char = buffer[x];
            if (char === 8 || char === 127) { // backspace and delete
                i--;
            } else {
                // workaround described above
                if (x > 0 && char === 160 && buffer[x - 1] === 226) {
                    i -= 2;
                }
                outBuffer[i] = char;
                i++;
            }
            i = Math.max(i, 0);
        }

        return outBuffer;
    }

    /*
     * Display output in targeted output channel
     */
    output(data: any) {
        if (this.outputChannel) {
            this.outputChannel.append(data);
        }
    }

    /*
     * Kill the process (spawned process only)
     */
    kill() {
        if (this.invocation) {
            const self = this;
            const signal = 'SIGKILL';
            psTree(self.invocation.pid, function(err, children) {
                [self.invocation.pid].concat(
                    children.map(function(p) {
                        return p.PID;
                    }),
                ).forEach(function(tpid) {
                    try {
                        self.output(`killing ${tpid}\n`);
                        process.kill(tpid, signal);
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                });
            });

            if (this.outputChannel) {
                this.outputChannel.show();
            }
        }
    }
}
