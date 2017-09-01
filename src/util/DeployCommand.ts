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

import {window, workspace} from 'vscode';
import {SystemCommand} from './SystemCommand';
const fs = require('fs');
const yaml = require('js-yaml');

/*
 * Class for invoking system commands with prompt(s) for input
 */
export class DeployCommand extends SystemCommand {

    /*
     * Validate cli-config and then execute the deploy command
     */
    execute(): Promise<any> {
        const targetFile = workspace.rootPath + '/cli-config.yml';

        if (!fs.existsSync(targetFile)) {
            return new Promise((resolve, reject) => {
                this.displayError('Could not find file cli-config.yml in project root.  Aborting deployment.');
            });
        }

        const yml = yaml.safeLoad(fs.readFileSync(targetFile, 'utf8'));

        // if deploy target is "container", validate the deploy-imate-target and ibm-cluster values
        const deployTarget = yml['deploy-target'];
        if (deployTarget === 'container') {

            const deployImageTarget = yml['deploy-image-target'];
            if (deployImageTarget === undefined || deployImageTarget === '') {
                return new Promise((resolve, reject) => {
                    this.displayError('Please specify \'deploy-image-target\' in cli-config.yml for Kubernetes deployment.');
                });
            } else {
                const regex = new RegExp(/registry.*.bluemix.net/);
                if (regex.test(deployImageTarget)) {
                    const cluster = yml['ibm-cluster'];
                    if (cluster === undefined || cluster === '') {
                        return new Promise((resolve, reject) => {
                            this.displayError('Please specify \'ibm-cluster\' in cli-config.yml for Kubernetes deployment targeting IBM Cloud.');
                        });
                    }
                }
            }
        }
        else if (deployTarget !== 'buildpack' && (deployTarget !== '' && deployTarget !== undefined)) {
            return new Promise((resolve, reject) => {
                this.displayError('Invalid \'deploy-target\' value in cli-config.yml.');
            });
        }
        return super.execute();
    }

    /*
     * display error message
     */
    displayError(message: string) {
        this.output(`\nERROR: ${message}`);
        window.showErrorMessage(message);
    }
}