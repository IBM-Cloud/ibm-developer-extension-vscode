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