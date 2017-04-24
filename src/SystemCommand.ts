'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
let spawn = require('child_process').spawn;
let psTree = require('ps-tree');

export class SystemCommand {
    command: string;
    args:Array<string>;
    invocation:any;
    outputChannel:vscode.OutputChannel;

    constructor(public _command:string, public _args:Array<string>, public _outputChannel:vscode.OutputChannel,
    _additionalArgs:string[] = []) {
        this.command = _command;
        this.args = _args;
        this.outputChannel = _outputChannel

        this.outputChannel.show();
    }

    isActive() {
        return (this.command != undefined);
    }

    destroy() {
        this.command = undefined;
        this.args = undefined;
        this.outputChannel = undefined;
        this.invocation = undefined;
    }


    execute() {
        if (vscode.workspace.rootPath == undefined ) {
            let message = "Please select your project's working directory.";
            this.outputChannel.append(`\n ERROR: ${message}`);
            vscode.window.showErrorMessage(message);
            return;
        }

        this.outputChannel.append(`\n> ${this.command} ${this.args.join(' ')}\n`);


        let opt = {
            cwd:vscode.workspace.rootPath
        }
        this.invocation = spawn(this.command, this.args, opt);

        this.invocation.stdout.on('data', (data) => {
            this.outputChannel.append(`${data}`);
        });

        this.invocation.stderr.on('data', (data) => {
            this.outputChannel.append(`${data}`);
        });

        this.invocation.on('close', (code) => {
            this.outputChannel.append(`\n`);
            this.destroy();
        });
    }


    kill() {
        if (this.invocation != undefined) {
            //this.invocation.stdin.pause();
            let self = this;
            let  signal = 'SIGKILL';
            psTree(self.invocation.pid, function (err, children) {
            [self.invocation.pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { 
                    self.outputChannel.append(`killing ${tpid}\n`);
                    process.kill(tpid, signal) 
                }
                catch (ex) { 
                    console.log(ex)
                }
            });
        });
        }
    }
}
