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

import { window } from 'vscode';
import { PromptingCommand, PromptInput } from './PromptingCommand';
import { SystemCommand } from './SystemCommand';

/*
 * Class for deploying through IBM Cloud IKS
 */
export class DeployCommand extends PromptingCommand {

    /*
     * Attempt to provide options for user to select for deployment
     */
    async execute(): Promise<any> {

        const getClustersCmd = new SystemCommand('ibmcloud', ['ks','clusters','--output', 'json']);
        await getClustersCmd.execute();

        if (getClustersCmd.stderr) {
            this.displayError(getClustersCmd.stderr);
            throw new Error(getClustersCmd.stderr);
        }

        this.inputs = [
            new PromptInput('Specify a cluster name', '--ibm-cluster'), 
            new PromptInput('Specify deploy image target', '--deploy-image-target')
        ];
        try {

            // Attempt to get a list a cluster names for the user to pick for deployment
            // otherwise, let the user enter into input box the cluster name
            if (getClustersCmd.stdout) {
                const clusters = JSON.parse(getClustersCmd.stdout);
                const clusterNames = clusters.map((c:any) => c.name);
                this.inputs[0].pickerOptions = clusterNames;
                this.inputs[0].prompt = 'Specify a cluster';
            } 
        } catch(e) {
            console.warn('Could not provide list of clusters for user ', e);
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
