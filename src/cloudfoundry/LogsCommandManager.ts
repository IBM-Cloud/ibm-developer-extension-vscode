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

import {commands, window, ExtensionContext, OutputChannel} from 'vscode';
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
     * @param {ExtensionContext} the extension's context
     * @param {key} the event/key for the command
     */
    static registerCommand(context: ExtensionContext, key: string) {

        if (LogsCommandManager.instance === undefined) {
            LogsCommandManager.instance = new LogsCommandManager();
        }

        const disposable = commands.registerCommand(key, () => {
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
     * @returns {ExtensionContext}
     */
    getOutputChannel(key): OutputChannel {
        if (this.outputChannels[key] === undefined) {
            this.outputChannels[key] = window.createOutputChannel(`Bluemix: CloudFoundry: ${key}`);
        }
        return this.outputChannels[key];
    }

    /*
     * start consuming logs (user prompted for app name)
     */
    startLogs() {
        const self = this;
        window.showInputBox({prompt: 'Please specify an app name'})
        .then((val) => {
            const outputChannel = self.getOutputChannel(val);

            // todo: check if already active
            const command = new SystemCommand('bx', ['cf', 'logs', val], outputChannel);
            command.executeWithOutputChannel();

            self.activeLogs[val] = command;
        });
    }

    /*
     * stop consuming logs
     */
    stopLogs() {
        const logs = [];

        for (const key in this.activeLogs) {
            if (this.activeLogs[key] !== undefined && this.activeLogs[key].isActive) {
                logs.push(key);
            }
        }

        window.showQuickPick(logs)
        .then((val) => {
            if (val !== undefined && val !== '') {
                const command = this.activeLogs[val];
                if (command !== undefined) {
                    command.kill();
                }
                this.activeLogs[val] = undefined;
            }
        });
    }


}