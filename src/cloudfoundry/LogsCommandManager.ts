'use strict';

import * as vscode from 'vscode';
import {PromptingCommand, PromptInput} from '../util/PromptingCommand';
import {SystemCommand} from '../util/SystemCommand';

/*
 * Class to manage log streams from 'cf logs'.
 * Can handle multiple streams using multiple output channels
 */
export class LogsCommandManager {

    private static instance: LogsCommandManager = undefined;
    private outputChannels: Object = {};
    private activeLogs: Object = {};

    /*
     * Register teh log start/stop commands
     * @param {vscode.ExtensionContext} the extension's context
     * @param {key} the event/key for the command
     */
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

    /*
     * Fetch an output channel for a key
     * @param {key} the CF app name
     * @returns {vscode.ExtensionContext}
     */
    getOutputChannel(key): vscode.OutputChannel {
        if (this.outputChannels[key] === undefined) {
            this.outputChannels[key] = vscode.window.createOutputChannel(`Bluemix: CloudFoundry: ${key}`);
        }
        return this.outputChannels[key];
    }

    /*
     * start consuming logs (user prompted for app name)
     */
    startLogs() {
        let self = this;
        vscode.window.showInputBox({prompt: 'Please specify an app name'})
        .then((val) => {
            let outputChannel = self.getOutputChannel(val);

            // todo: check if already active
            let command = new SystemCommand('bx', ['cf', 'logs', val], outputChannel);
            command.executeWithOutputChannel();

            self.activeLogs[val] = command;
        });
    }

    /*
     * stop consuming logs
     */
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