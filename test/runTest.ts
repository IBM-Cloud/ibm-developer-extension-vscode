/**
 * Copyright IBM Corporation 2016, 2023
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
import * as path from 'path';
import { stat, mkdirSync } from 'fs';

import { downloadAndUnzipVSCode, runTests } from '@vscode/test-electron';

async function dirExists(dir: string) {
    return new Promise((resolve) => {
        stat(dir, (err, file) => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(file.isDirectory());
        });
    });
}

async function go() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, '../..');
        const extensionTestsPath = path.resolve(__dirname, './');
        const testWorkspace = path.resolve(__dirname, '../../test/workspace');

        // Create workspace if directory does not already exist
        const workspaceExists = await dirExists(testWorkspace);
        if (!workspaceExists) {
            console.log('Could not find workspace. Creating workspace folder...');
            mkdirSync(testWorkspace);
            console.log(`Workspace folder ${testWorkspace} was created`);

        }

        const vscodeExecutablePath = await downloadAndUnzipVSCode();
        await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                testWorkspace,
                // This disables all extensions except the one being testing
                '--disable-extensions',
            ],
        });
    } catch (err) {
        console.error(err);
        console.error('Failed to run tests');
        process.exit(1);
    }
}

go();
