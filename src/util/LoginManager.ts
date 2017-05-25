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

import {commands, window, ExtensionContext} from 'vscode';
import {BluemixTerminal} from './BluemixTerminal';

/*
 * Managers interaction with integrated terminal to handle login/logout of bx cli
 */
export class LoginManager {

    /*
     * register login/logout command, with respect to this manager's terminal
     * @param {ExtensionContext} the vscode.ExtensionContext from extension activation
     * @param {string} event name/key for the extension action
     */
    static registerCommand(context: ExtensionContext, key: string) {
        const disposable = commands.registerCommand(key, () => {

            const terminalArgs = ['bx', 'login'];
            if (key === 'extension.bx.login') {
                // add nothing for now
            } else if (key === 'extension.bx.login.sso') {
                terminalArgs.push('--sso');
            }

            const terminal = BluemixTerminal.instance;
            terminal.sendText(`${terminalArgs.join(' ')}\n`);
            terminal.show(false);

            window.showInformationMessage('Complete your login in the Terminal panel below.');
        });
        context.subscriptions.push(disposable);
    }

}