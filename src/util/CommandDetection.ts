/**
 * Copyright IBM Corporation 2016, 2021
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

import {window} from 'vscode';


/*
 * Used to determine whether a command or plugin is installed
 * Only should be called by SystemCommand error handler
 */
export class CommandDetection {

    static ERR_NONE: number = 0;
    static ERR_UNKNOWN: number = 1;
    static ERR_COMMAND_NOT_FOUND: number = 2;
    static ERR_PLUGIN_NOT_FOUND: number = 3;

    /*
     * Determine error condition from SystemCommand
     * @param {number} the exit code of the ChildProcess instance
     * @param {string} stdout from the ChildProcess
     * @param {string} stderr from the ChildProcess
     */
    public static determineErrorCondition(code: number, stdout: string, stderr: string): number {
        if (code < 0) {
            return CommandDetection.ERR_COMMAND_NOT_FOUND;
        } else if (stdout.search('not a registered command') >= 0) {
            return CommandDetection.ERR_PLUGIN_NOT_FOUND;
        }
        return CommandDetection.ERR_NONE;
    }
}
