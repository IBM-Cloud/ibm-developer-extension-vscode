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

import {window, Disposable, Terminal} from 'vscode';

/*
 * Singleton instance of Terinal wth Bluemix identifier
 * for use globally within this extension
 */
export class BluemixTerminal {

    private static _terminal: Terminal;
    private static windowListener: Disposable;
    private static TERMINAL_NAME = 'Bluemix';

    /*
     * @returns {Terminal} instance
     */
    public static get instance(): Terminal {

        if (this._terminal === undefined) {
            this._terminal = window.createTerminal(BluemixTerminal.TERMINAL_NAME, '', []);
            this.initWindowListener();
        }
        this._terminal.show();
        return this._terminal;
    }

    /*
     * initialize a listener on the window object to detect whenever a terminal is closed.
     * this way we can create a new one if its closed
     */
    static initWindowListener() {
        if (this.windowListener === undefined) {
            this.windowListener = window.onDidCloseTerminal((e: Terminal) => {
                if (e.name === BluemixTerminal.TERMINAL_NAME) {
                    this._terminal = undefined;
                }
            });
        }
    }

}
