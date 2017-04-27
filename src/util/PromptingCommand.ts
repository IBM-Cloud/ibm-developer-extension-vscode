'use strict';

import * as vscode from 'vscode';
import {SystemCommand} from './SystemCommand';

/*
 * Class for specifying a command with prompt for input as parameters for PromptingCommand class
 */
export class PromptInput {

    prompt: string = '';
    prefixArgument = undefined;

    constructor( public _prompt: string, public _prefixArgument: string = undefined) {
        this.prompt = _prompt;
        this.prefixArgument = _prefixArgument;
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
     * @param {vscode.OutputChannel} output channel to display system process output
     * @param {PromptInput[]} array of input definitions for vscode prompts
     * @param {string[]} additional arguments to append at the end of system call
     */
    constructor(public command: string, public args: string[], public _outputChannel: vscode.OutputChannel, inputs: PromptInput[], additionalArgs: string[]) {
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

        let self = this;
        let input = this.inputs[this.index];

        return new Promise<any>((resolve, reject) => {
            vscode.window.showInputBox({prompt: input.prompt})
            .then((val) => {
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
            });
        });
    }


    /*
     * Destroy references in this class to prevent memory leaks
     */
    destory() {
        super.destroy();
        this.inputs = undefined;
        this.additionalArgs = undefined;
    }

}
