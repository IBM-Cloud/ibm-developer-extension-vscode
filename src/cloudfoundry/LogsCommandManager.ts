'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {PromptingCommand, PromptInput} from '../PromptingCommand';
import {SystemCommand} from '../SystemCommand';


export class LogsCommandManager {

    private static instance: LogsCommandManager = undefined;
    private outputChannels: Object = {};
    private activeLogs: Object = {};

    static registerCommand(context: vscode.ExtensionContext, key: string) {

        if (LogsCommandManager.instance === undefined) {
            LogsCommandManager.instance = new LogsCommandManager();
        }

        let disposable = vscode.commands.registerCommand(key, () => {
            if (key === 'extension.bx.cf.logs') {
                LogsCommandManager.instance.startLogs();
            } else if (key === 'extension.bx.cf.logs-stop') {
                LogsCommandManager.instance.stopLogs();
            }
        });
        context.subscriptions.push(disposable);
    }

    getOutputChannel(key) {
        if (this.outputChannels[key] === undefined) {
            this.outputChannels[key] = vscode.window.createOutputChannel(`Bluemix: CloudFoundry: ${key}`);
        }
        return this.outputChannels[key];
    }

    startLogs() {
        let self = this;
        vscode.window.showInputBox({prompt: 'Please specify an app name'})
        .then((val) => {
            let outputChannel = self.getOutputChannel(val);

            // check if already active
            let command = new SystemCommand('bx', ['cf', 'logs', val], outputChannel);
            command.executeWithOutputChannel();

            self.activeLogs[val] = command;
        });
    }

    stopLogs() {

        let logs = [];

        for (let key in this.activeLogs) {
            if (this.activeLogs[key] !== undefined && this.activeLogs[key].isActive) {
                logs.push(key);
            }
        }

        vscode.window.showQuickPick(logs)
        .then((val) => {
            if (val !== undefined && val !== '') {
                let command = this.activeLogs[val];
                if (command !== undefined) {
                    command.kill();
                }
                this.activeLogs[val] = undefined;
            }
        });
    }


}