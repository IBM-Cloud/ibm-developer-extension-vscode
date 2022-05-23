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
import { window } from 'vscode';
import { PromptingCommand, PromptInput } from '../../util/PromptingCommand';
import { getInstalledPlugins, getRepoPlugins } from '../../ibmcloud/plugin';

export class PluginInstallCommand extends PromptingCommand {

    async execute(): Promise<any> {

        this.inputs = [
            new PromptInput('Specify a plugin to install')
        ];

        try {
                const installedPlugins = await getInstalledPlugins();
                const allPlugins = await getRepoPlugins();

                this.inputs[0].pickerOptions = allPlugins.filter((name:string) => installedPlugins.indexOf(name) == -1);
        } catch (e) {
            console.error('Could not provide picker options for plugin list');
            console.error(e);
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
