/**
 * Copyright IBM Corporation 2016, 2017
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

import {window, OutputChannel, QuickPickOptions} from 'vscode';
import {SystemCommand} from './SystemCommand';

/*
 * Class for specifying a command with prompt for input as parameters for PromptingCommand class
 */
export class PromptInput {

    prompt: string = '';
    prefixArgument = undefined;
    pickerOptions: string[] = undefined;

    constructor( public _prompt: string, public _prefixArgument: string = undefined, pickerOptions: string[] = undefined) {
        this.prompt = _prompt;
        this.prefixArgument = _prefixArgument;
        this.pickerOptions = pickerOptions;
    }
}

/*
 * Class for invoking system commands with prompt(s) for input
 */
export class PromptingCommand extends SystemCommand {

    inputs: PromptInput[] = [];
    index: number = 0;
    originalArgs: any[] = [];
    additionalArgs: any[] = [];

    /*
     * Constructor
     * @param {string} command to be executed
     * @param {string[]} array of additional arguments
     * @param {OutputChannel} output channel to display system process output
     * @param {PromptInput[]} array of input definitions for vscode prompts
     * @param {string[]} additional arguments to append at the end of system call
     */
    constructor(public command: string, public args: string[], public _outputChannel: OutputChannel, inputs: PromptInput[], additionalArgs: string[] = []) {
        super(command, args, _outputChannel);
        this.originalArgs = args.slice(0);

        this.inputs = inputs;
        this.additionalArgs = additionalArgs;
    }

    /*
     * Execute the commmand
     */
    execute(): Promise<any> {
        // duplicate the array, don't copy the instance
        this.args = this.originalArgs.slice(0);
        this.index = 0;
        return this.requestInput();
    }

    /*
     * Prompt for input from the user
     */
    requestInput(): Promise<any> {

        const self = this;
        const input = this.inputs[this.index];

        return new Promise<any>((resolve, reject) => {

            const handler = (val) => {
                if (val !== undefined && val.length > 0) {
                    if (input.prefixArgument !== undefined) {
                        self.args.push( input.prefixArgument );
                    }
                    self.args.push(val);
                    self.index++;
                    if (self.index < self.inputs.length) {
                        self.requestInput();
                    }
                    else {
                        // put any additional arguments on the end, like a -f
                        self.args = self.args.concat(self.additionalArgs);
                        super.execute()
                        .then((value: any) => {
                            resolve(value);
                        }, (reason: any) => {
                            reject(reason);
                        });
                    }
                }
                else {
                    this.output(`\n'${this.command} ${this.args.join(' ')}' action canceled: no user input at prompt.`);
                }
            };

            let invocation;
            if (input.pickerOptions !== undefined && input.pickerOptions.length > 0) {
                invocation = window.showQuickPick(input.pickerOptions);
            } else {
                invocation = window.showInputBox({prompt: input.prompt});
            }
            invocation.then(handler);
        });
    }


    /*
     * Destroy references in this class to prevent memory leaks
     */
    destroy() {
        super.destroy();
        this.inputs = undefined;
        this.additionalArgs = undefined;
    }

}
