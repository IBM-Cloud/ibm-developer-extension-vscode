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
import { PromptingCommand } from '../../util/PromptingCommand';
import { getInstalledPlugins } from '../../ibmcloud/plugin';

export class PluginUpdateUninstallCommand extends PromptingCommand {

    async execute(): Promise<any> {

        try {
            const installedPlugins = await getInstalledPlugins();
            if (installedPlugins.length === 0) {
                this.displayWarning('No plugins are installed. Please install a plugin before trying again.');
                return;
            }

            this.inputs[0].pickerOptions = installedPlugins;
        } catch (e) {
            console.error('Could not provide picker options for plugin list');
            console.error(e);
        }

        return super.execute();
    }

    /*
     * display warning message
     */
    displayWarning(message: string) {
        window.showWarningMessage(message);
    }
}
