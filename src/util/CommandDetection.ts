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