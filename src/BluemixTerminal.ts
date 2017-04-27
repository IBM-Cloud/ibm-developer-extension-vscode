'use strict';

import * as vscode from 'vscode';

/*
 * Singleton instance of vscode.Terinal wth Bluemix identifier
 * for use globally within this extension
 */
export class BluemixTerminal {

    private static _terminal: vscode.Terminal;

    /*
     * @returns {vscode.Terminal} instance
     */
    public static get instance(): vscode.Terminal {
        if (this._terminal === undefined) {
            this._terminal = vscode.window.createTerminal('Bluemix', '', []);
        }
        return this._terminal;
    }

}
