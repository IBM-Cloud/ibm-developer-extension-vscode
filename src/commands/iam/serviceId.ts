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

import { getServiceIds, ServiceId } from "../../ibmcloud/iam";
import { PromptingCommand } from "../../util/PromptingCommand";

export class ServiceIdCommand extends PromptingCommand {

    async execute(): Promise<any> {

        try {
            const serviceIds = await getServiceIds();
            this.inputs[0].pickerOptions = serviceIds.map((serviceId:ServiceId) => serviceId.name);
        } catch(e) {
            console.error('Could not provide picker options for service id list');
            console.error(e);
        }

        return super.execute();
    }
}
