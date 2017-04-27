'use strict';

import {window, Terminal} from 'vscode';

/*
 * Singleton instance of Terinal wth Bluemix identifier
 * for use globally within this extension
 */
export class BluemixTerminal {

    private static _terminal: Terminal;

    /*
     * @returns {Terminal} instance
     */
    public static get instance(): Terminal {
        if (this._terminal === undefined) {
            this._terminal = window.createTerminal('Bluemix', '', []);
        }
        return this._terminal;
    }

}
