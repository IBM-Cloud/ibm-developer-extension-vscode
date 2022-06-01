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

import { SystemCommand } from '../util/SystemCommand';
import * as semver from 'semver';
import { IBMCloud } from '../consts';

export interface PluginVersion {
    version: string
}

export interface RepoPlugin {
    readonly name: string
    readonly versions: Array<PluginVersion>
}

export interface PluginMetadata {
    readonly Name: string
}


/**
 * Retrieve all plugins in a given repository description
 * @param {string} repoName The repository where the plugins are stored (Default: "IBM Cloud")
 * @returns {Promise<Array><string>>}
 */
export async function getRepoPlugins(repoName: string = IBMCloud): Promise<Array<string>> {
    const allList = new SystemCommand('ibmcloud', ['plugin', 'repo-plugins', '--output', 'json']); 
    await allList.execute();

    if (allList.stderr) {
        throw new Error(allList.stderr);
    }

    const repoPlugins: Array<RepoPlugin> = JSON.parse(allList.stdout)[repoName];
    return repoPlugins.map((plugin:RepoPlugin) => plugin.name);
}

/**
* Retrieve all installed plugins
* @returns {Promise<Array><string>>}
*/
export async function getInstalledPlugins(): Promise<Array<string>> {
    const installedList = new SystemCommand('ibmcloud', ['plugin', 'list', '--output', 'json']);
    await installedList.execute();
    if (installedList.stderr) {
        throw new Error(installedList.stderr);
    }
    const pluginMetas: Array<PluginMetadata> = JSON.parse(installedList.stdout);

    return pluginMetas.map((meta:PluginMetadata) => meta.Name);
}

/**
 * Retrieve a list of available versions for a given plugin in a repository. Sorted in descending order
 * @param {string} pluginName The name of the plugin
 * @param {string} repoName The name of the repo (Default: "IBM Cloud")
 * @returns {Promise<Array<PluginVersion>>}
 */ 
export async function getPluginVersions(pluginName:string, repoName:string = IBMCloud): Promise<Array<PluginVersion>> {
    const repoPluginCmd = new SystemCommand('ibmcloud', ['plugin', 'repo-plugin', pluginName, '-r', repoName, '--output', 'json']);
    await repoPluginCmd.execute();
    if (repoPluginCmd.stderr) {
        throw new Error(repoPluginCmd.stderr);
    }

    const repoPluginInfo: RepoPlugin = JSON.parse(repoPluginCmd.stdout); 
    try { 
        repoPluginInfo.versions.sort((a:PluginVersion, b:PluginVersion) => {
            return semver.lt(semver.clean(a.version), semver.clean(b.version)) ? 1 : 0;
        });
    } catch (e) {
        console.log(`Failed to parse repo-plugin metadata for plugin ${pluginName}`);
        throw new Error(e);
    }

    return repoPluginInfo.versions;
}
