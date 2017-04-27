'use strict';

import * as vscode from 'vscode';
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
    static registerCommand(context: vscode.ExtensionContext, key: string) {
        let disposable = vscode.commands.registerCommand(key, () => {

            let terminalArgs = ['bx', 'login'];
            if (key === 'extension.bx.login') {
                // add nothign for now
            } else if (key === 'extension.bx.login.sso') {
                terminalArgs.push('--sso');
            }

            let terminal = BluemixTerminal.instance;
            terminal.sendText(`${terminalArgs.join(' ')}\n`);
            terminal.show(false);
        });
        context.subscriptions.push(disposable);
    }

}