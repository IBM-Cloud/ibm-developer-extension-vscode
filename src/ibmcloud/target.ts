/**
 * Copyright IBM Corporation 2016, 2022
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

import { SystemCommand } from '../util/SystemCommand';
import { CF } from './cf';
import { window } from 'vscode';

export interface Target {
    readonly cf?: CF
}

/**
 * Return true if CF is targeted
 * @returns {Promise<boolean>}
 */
export async function isCF(): Promise<boolean> {
    const targetCmd = new SystemCommand('ibmcloud', ['target', '--output', 'json']);
    await targetCmd.execute();

    if (targetCmd.stderr) {
        throw new Error(targetCmd.stderr);
    }

    const target: Target = JSON.parse(targetCmd.stdout);

    return !!target.cf;
}

/**
 * Select and target the CF endpoint, org and space for an account
 * @returns {Promise<void>}
 */
export async function targetCF(): Promise<void> {
    // NOTE: Running command via terminal in case the user needs to select from multiple orgs/spaces
    const targetCFCmd = new SystemCommand('ibmcloud', ['target', '--cf']);
    await targetCFCmd.executeWithTerminal(true);
}
