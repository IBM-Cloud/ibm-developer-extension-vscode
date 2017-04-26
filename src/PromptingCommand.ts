'use strict';

import * as vscode from 'vscode';
import {SystemCommand} from './SystemCommand';

export class PromptInput {

    prompt: string = '';
    prefixArgument = undefined;

    constructor( public _prompt: string, public _prefixArgument: string = undefined) {
        this.prompt = _prompt;
        this.prefixArgument = _prefixArgument;
    }
}


export class PromptingCommand extends SystemCommand {

    inputs: PromptInput[] = [];
    index: number = 0;
    originalArgs: any[] = [];
    additionalArgs: any[] = [];

    constructor(public _command: string, public _args: string[], public _outputChannel: vscode.OutputChannel, inputs: PromptInput[], additionalArgs: string[]) {
        super(_command, _args, _outputChannel);
        this.originalArgs = _args.slice(0);

        this.inputs = inputs;
        this.additionalArgs = additionalArgs;
    }

    execute() {
        // duplicate the array, don't copy the instance
        this.args = this.originalArgs.slice(0);
        this.index = 0;
        this.requestInput();
    }

    requestInput () {

        let self = this;
        let input = this.inputs[this.index];
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
                super.execute();
            }
        });
    }

    destory() {
        super.destroy();
        this.inputs = undefined;
        this.additionalArgs = undefined;
    }

}
