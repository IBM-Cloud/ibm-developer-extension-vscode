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
import * as path from 'path';
import {  spawnSync } from 'child_process';
import { stat, mkdirSync, rmdirSync } from 'fs';

import { downloadAndUnzipVSCode, runTests } from '@vscode/test-electron';

const TEST_APP_NAME = 'vscodepythontest';

async function dirExists(dir:string) {
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

function downloadTestAppCode(workspace:string) {
    const loginCmd = spawnSync('ibmcloud', ['login', '-r',  'us-south', '-a', 'https://cloud.ibm.com', '-g', 'bdd_test'], {encoding: 'utf-8'});
    if (loginCmd.status != 0) {
        throw new Error(`Failed to login to IBMCloud: ${loginCmd.stderr}`); 
    }
    const downloadCodeCmd = spawnSync('ibmcloud', ['dev', 'code', TEST_APP_NAME, '--trace'], { cwd: workspace, encoding: 'utf-8' });
    console.log(downloadCodeCmd.stdout);
    if (downloadCodeCmd.status != 0) {
        throw new Error(`Failed to download test app code: ${downloadCodeCmd.stderr}`);
    }
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
        const bluemixHomeDir = `${testWorkspace}/.bluemix`;
        const homeDirExists = await dirExists(bluemixHomeDir);

        // Delete IBMCLOUD_HOME directory on each test run
        if (homeDirExists) {
            console.log(`Clearing IBMCLOUD_HOME directory: ${bluemixHomeDir}`);
            rmdirSync(bluemixHomeDir, { recursive: true });
        }

        // Check if test project already exists if not download code into workspace
        const testAppWorkspace = `${testWorkspace}/${TEST_APP_NAME}`;
        const testAppExists = await dirExists(testAppWorkspace);
        if (!testAppExists) {
            console.log('Could not find test code. Downloading test app code...');
            downloadTestAppCode(testWorkspace);
            console.log('Finished downloading test app code...');
        } else {
            console.log('Found existing test app in workspace. Skip downloading code...');
        }


        // NOTE: As of now the latest VSCode (1.67.0) is modifiying the package.json after test is completed
        // Until this issue is fixed use 1.66.2 to test against
        // REF: https://github.com/microsoft/vscode/issues/148975
        const vscodeExecutablePath = await downloadAndUnzipVSCode('1.66.2');
        await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath,
            extensionTestsEnv: {
                IBMCLOUD_HOME: testWorkspace
            },
            launchArgs: [
                testAppWorkspace,
                // This disables hardware acceleration that may cause problems in running tests in build process
                '--disable-gpu',
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
