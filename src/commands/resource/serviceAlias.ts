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

'use strict';

import { window } from 'vscode';
import { getServiceAliases, Resource } from '../../ibmcloud/resource';
import { isCF, targetCF } from '../../ibmcloud/target';
import { PromptingCommand } from '../../util/PromptingCommand';

export class ServiceAliasCommand extends PromptingCommand {

    async execute(): Promise<any> {
        try {
            if (!await isCF()) {
                await targetCF();
            }

            const serviceAliases = await getServiceAliases();
            if (serviceAliases.length === 0) {
                this.displayWarning('No service alias could be found. Please create a service alias and try again');
                return;
            }

            // NOTE: Currently we only provide picker options for service-aliases 
            // since we can't get a consumable format from CLI to get cf apps
            // so user must enter the app name manually
            this.inputs[0].pickerOptions = serviceAliases.map((serviceAlias: Resource) => serviceAlias.name);

        } catch (e) {
            console.error('Could not picker options for service aliases list');
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
