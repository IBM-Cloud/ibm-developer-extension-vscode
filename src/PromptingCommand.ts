'use strict';

import * as vscode from 'vscode';
import {SystemCommand} from './SystemCommand';


export class PromptingCommand extends SystemCommand {

    prompts:string[] = [];
    index:number = 0;
    originalArgs:any[] = [];
    additionalArgs:any[] = [];
    promptPrefixArgs:string[] = [];

    constructor(public _command: string, public _args: Array<string>, public _outputChannel: vscode.OutputChannel, prompts:any, additionalArgs:string[], promptPrefixArgs:string[] = []) {
        super(_command, _args, _outputChannel);
        this.originalArgs = _args.slice(0);

        if (!(prompts instanceof Array)) {
            prompts = [prompts.toString()]
        }
        this.prompts = prompts;
        this.additionalArgs = additionalArgs;
        this.promptPrefixArgs = promptPrefixArgs;
    }

    execute() {
        //duplicate the array, don't copy the instance
        this.args = this.originalArgs.slice(0);
        this.index = 0;
        this.requestInput(); 
    }

    requestInput () {

        let self = this;
        vscode.window.showInputBox({prompt: self.prompts[self.index]})
        .then(val => {
            if (self.index < self.promptPrefixArgs.length ) {
                self.args.push( self.promptPrefixArgs[self.index] );
            }
            self.args.push(val);
            self.index++;
            if (self.index < self.prompts.length) {
                self.requestInput();
            }
            else {
                self.args = self.args.concat(self.additionalArgs)
                super.execute();
            }
        })      
    }

    destory() {
        super.destroy();
        this.prompts = undefined;
        this.additionalArgs = undefined;
        this.promptPrefixArgs = undefined;
    }

}
