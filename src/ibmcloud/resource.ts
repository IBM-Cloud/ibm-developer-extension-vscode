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

import { SystemCommand } from "../util/SystemCommand";

export interface Resource {
    readonly guid: string
    readonly name: string
}

export async function getServiceAliases(): Promise<Array<Resource>> {
    const cmd = new SystemCommand('ibmcloud', ['resource', 'service-aliases', '--output', 'json']); 
    await cmd.execute();
    if (cmd.stderr) {
        throw new Error(cmd.stderr);
    }

    const resources: Array<Resource> = JSON.parse(cmd.stdout);

    return resources;
}
