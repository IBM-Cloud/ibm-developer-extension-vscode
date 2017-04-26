'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export class LoginTerminalManager {

    static registerCommand(context: vscode.ExtensionContext, key: string) {


        let disposable = vscode.commands.registerCommand(key, () => {

            let terminalArgs = ['bx', 'login'];
            if (key === 'extension.bx.login') {
                // add nothign for now
            } else if (key === 'extension.bx.login.sso') {
                terminalArgs.push('--sso');
            }

            let terminal = vscode.window.createTerminal('Bluemix', '', terminalArgs);
            terminal.sendText(`${terminalArgs.join(' ')}\n`);
            terminal.show(false);
        });
        context.subscriptions.push(disposable);
    }

}