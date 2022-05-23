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
import { SystemCommand } from '../util/SystemCommand';
import { IBMCloud } from '../consts';

export interface RepoPlugin {
    readonly name: string
}

export interface PluginMetadata {
    readonly Name: string
}

// Retrieve all plugins in a given repository
// @param {string} repoName The repository where the plugins are stored "Default: IBM Cloud" 
export async function getRepoPlugins(repoName: string = IBMCloud): Promise<Array<string>> {
    const allList = new SystemCommand('ibmcloud', ['plugin', 'repo-plugins', '--output', 'json']); 
    await allList.execute();

    if (allList.stderr) {
        throw new Error(allList.stderr);
    }

    const repoPlugins: Array<RepoPlugin> = JSON.parse(allList.stdout)[repoName];
    return repoPlugins.map((plugin:RepoPlugin) => plugin.name);
}

// Retrieve all installed plugins
export async function getInstalledPlugins(): Promise<Array<string>> {
    const installedList = new SystemCommand('ibmcloud', ['plugin', 'list', '--output', 'json']);
    await installedList.execute();
    if (installedList.stderr) {
        throw new Error(installedList.stderr);
    }
    const pluginMetas: Array<PluginMetadata> = JSON.parse(installedList.stdout);
        return pluginMetas.map((meta:PluginMetadata) => meta.Name);
}
