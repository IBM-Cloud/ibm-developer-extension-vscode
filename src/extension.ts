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

import { commands, window, ExtensionContext } from 'vscode';
import { LogsCommandManager } from './cloudfoundry/LogsCommandManager';
import { LoginManager } from './util/LoginManager';
import { PromptingCommand, PromptInput } from './util/PromptingCommand';
import { SystemCommand } from './util/SystemCommand';
import * as semver from 'semver';
import * as packageJson from '../package.json';
import { PluginInstallCommand, PluginUpdateUninstallCommand } from './commands/plugin';
import { ServiceIdCommand } from './commands/iam';
import { ServiceAliasCommand } from './commands/resource';


const outputChannel = window.createOutputChannel('IBMCloud');
let checkedVersions = false;

/*
 * activate method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 */
export function activate(context: ExtensionContext) {
    console.log('Congratulations, your extension "com-ibm-cloud" is now active!');

    checkVersions();

    LoginManager.registerCommand(context, 'extension.ibmcloud.login');
    LoginManager.registerCommand(context, 'extension.ibmcloud.login.sso');
    registerCommand(context, 'extension.ibmcloud.logout', { cmd: 'ibmcloud', args: ['logout'] }, outputChannel);
    registerCommand(context, 'extension.ibmcloud.cli-update', { cmd: 'ibmcloud', args: ['plugin', 'update', '--all', '-r', 'IBM Cloud'] }, outputChannel);
    registerCommand(context, 'extension.ibmcloud.cli-install', { cmd: 'ibmcloud', args: ['plugin', 'install', '--all', '-r', 'IBM Cloud', '-f'] }, outputChannel);
    registerCommand(context, 'extension.ibmcloud.api', { cmd: 'ibmcloud', args: ['api'] }, outputChannel);
    registerCommand(context, 'extension.ibmcloud.regions', { cmd: 'ibmcloud', args: ['regions'] }, outputChannel);
    registerCommand(context, 'extension.ibmcloud.target', { cmd: 'ibmcloud', args: ['target'] }, outputChannel);


    // IBM Cloud CF commands *************************************
    registerCommand(context, 'extension.ibmcloud.cf.apps', { cmd: 'ibmcloud', args: ['cf', 'apps'] }, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.app', { cmd: 'ibmcloud', args: ['cf', 'app'] }, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.create-app-manifest', { cmd: 'ibmcloud', args: ['cf', 'create-app-manifest'] }, outputChannel, [new PromptInput('Specify an app name')]);
    registerCommand(context, 'extension.ibmcloud.cf.push', { cmd: 'ibmcloud', args: ['cf', 'push'] }, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.push-appname', { cmd: 'ibmcloud', args: ['cf', 'push'] }, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.start', { cmd: 'ibmcloud', args: ['cf', 'start'] }, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.stop', { cmd: 'ibmcloud', args: ['cf', 'stop'] }, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.restart', { cmd: 'ibmcloud', args: ['cf', 'restart'] }, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.restage', { cmd: 'ibmcloud', args: ['cf', 'restage'] }, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.events', { cmd: 'ibmcloud', args: ['cf', 'events'] }, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.env', { cmd: 'ibmcloud', args: ['cf', 'env'] }, outputChannel, [new PromptInput('Specify an app name')]);
    LogsCommandManager.registerCommand(context, 'extension.ibmcloud.cf.logs');
    LogsCommandManager.registerCommand(context, 'extension.ibmcloud.cf.logs-stop');



    // IBM Cloud CS commands *************************************
    registerPromptingCommand(context, 'extension.ibmcloud.ks.cluster.get', { cmd: 'ibmcloud', args: ['ks', 'cluster', 'get'] }, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster')]);
    registerPromptingCommand(context, 'extension.ibmcloud.ks.cluster.rm', { cmd: 'ibmcloud', args: ['ks', 'cluster', 'rm'] }, outputChannel, [new PromptInput('Specify a cluster name or id')], ['-f']);
    registerCommand(context, 'extension.ibmcloud.ks.clusters', { cmd: 'ibmcloud', args: ['ks', 'clusters'] }, outputChannel);
    registerCommand(context, 'extension.ibmcloud.ks.init', { cmd: 'ibmcloud', args: ['ks', 'init'] }, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.ks.worker.get', { cmd: 'ibmcloud', args: ['ks', 'worker', 'get'] }, outputChannel, [new PromptInput('Specify cluster name or id', '--cluster'), new PromptInput('Specify worker id', '--worker')]);
    registerPromptingCommand(context, 'extension.ibmcloud.ks.worker.add', { cmd: 'ibmcloud', args: ['ks', 'worker', 'add'] }, outputChannel, [new PromptInput('Specify cluster name or id', '--cluster')], ['1']);
    registerPromptingCommand(context, 'extension.ibmcloud.ks.worker.reboot', { cmd: 'ibmcloud', args: ['ks', 'worker', 'reboot'] }, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster'), new PromptInput('Specify a worker id', '--worker')], ['-f']);
    registerPromptingCommand(context, 'extension.ibmcloud.ks.worker.reload', { cmd: 'ibmcloud', args: ['ks', 'worker', 'reload'] }, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster'), new PromptInput('Specify a worker id', '--worker')], ['-f']);
    registerPromptingCommand(context, 'extension.ibmcloud.ks.worker.rm', { cmd: 'ibmcloud', args: ['ks', 'worker', 'rm'] }, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster'), new PromptInput('Specify a worker id')], ['-f']);
    registerPromptingCommand(context, 'extension.ibmcloud.ks.workers', { cmd: 'ibmcloud', args: ['ks', 'workers'] }, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster')]);

    // IBM Cloud ACCOUNT commands *************************************
    registerCommand(context, 'extension.ibmcloud.account.list', { cmd: 'ibmcloud', args: ['account', 'list'] }, outputChannel, true);
    registerCommand(context, 'extension.ibmcloud.account.show', { cmd: 'ibmcloud', args: ['account', 'show'] }, outputChannel, true);
    registerCommand(context, 'extension.ibmcloud.account.users', { cmd: 'ibmcloud', args: ['account', 'users'] }, outputChannel, true);

    // IBM Cloud RESOURCE commands *************************************
    registerCommand(context, 'extension.ibmcloud.resource.service-instances', { cmd: 'ibmcloud', args: ['resource', 'service-instances'] }, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.resource.service-binding.list', { cmd: 'ibmcloud', args: ['resource', 'service-bindings'] }, outputChannel, [new PromptInput('Specify service alias')], [], false, ServiceAliasCommand);
    registerPromptingCommand(context, 'extension.ibmcloud.resource.service-binding.get', { cmd: 'ibmcloud', args: ['resource', 'service-binding'] }, outputChannel, [new PromptInput('Specify service alias'), new PromptInput('Specify Cloud Foundry app name')], [], false, ServiceAliasCommand);
    registerCommand(context, 'extension.ibmcloud.resource.service-alias.list', { cmd: 'ibmcloud', args: ['resource', 'service-aliases'] }, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.resource.service-alias.get', { cmd: 'ibmcloud', args: ['resource', 'service-alias'] }, outputChannel, [new PromptInput('Specify service alias')], [], false, ServiceAliasCommand);

    // IBM Cloud IAM commands *************************************
    registerCommand(context, 'extension.ibmcloud.iam.oauth-tokens', { cmd: 'ibmcloud', args: ['iam', 'oauth-tokens'] }, outputChannel);
    registerCommand(context, 'extension.ibmcloud.iam.service-ids', { cmd: 'ibmcloud', args: ['iam', 'service-ids'] }, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.iam.service-id', { cmd: 'ibmcloud', args: ['iam', 'service-id'] }, outputChannel, [new PromptInput('Specify a service ID')], [], false, ServiceIdCommand);


    // IBM Cloud PLUGIN commands *************************************
    registerPromptingCommand(context, 'extension.ibmcloud.plugin.install', { cmd: 'ibmcloud', args: ['plugin', 'install'] }, outputChannel, [], [], false, PluginInstallCommand);
    registerPromptingCommand(context, 'extension.ibmcloud.plugin.update', { cmd: 'ibmcloud', args: ['plugin', 'update'] }, outputChannel, [new PromptInput('Specify a plugin to update')], [], false, PluginUpdateUninstallCommand);
    registerPromptingCommand(context, 'extension.ibmcloud.plugin.uninstall', { cmd: 'ibmcloud', args: ['plugin', 'uninstall'] }, outputChannel, [new PromptInput('Specify a plugin to uninstall')], [], false, PluginUpdateUninstallCommand);
}


/*
 *  Helper utility to register system commands
 */
function registerCommand(context: ExtensionContext, key: string, opt, outputChannel, sanitizeOutput = false, CommandClass = SystemCommand, useTerminal = false) {
    const disposable = commands.registerCommand(key, () => {
        const command = new CommandClass(opt.cmd, opt.args, outputChannel, sanitizeOutput);
        command.useTerminal = useTerminal;
        return new Promise((resolve) => {
            resolve(executeCommand(command));
        });
    });
    context.subscriptions.push(disposable);
}


/*
 *  Helper utility to register prompting system commands
 */
function registerPromptingCommand(context: ExtensionContext, key: string, opt, outputChannel, inputs: PromptInput[], additionalArgs: string[] = [], sanitizeOutput = false, PromptingClass = PromptingCommand) {
    const disposable = commands.registerCommand(key, () => {
        const command = new PromptingClass(opt.cmd, opt.args, outputChannel, inputs, additionalArgs, sanitizeOutput);
        return new Promise((resolve) => {
            resolve(executeCommand(command));
        });
    });
    context.subscriptions.push(disposable);
}


function executeCommand(command: SystemCommand): Promise<any> {
    return command.execute();
}


/*
 *  Checks the version of the IBM Cloud CLI and notifies the user if cli or recommended plugins are out of date
 */
function checkVersions(): Promise<any> {

    return new Promise<void>((resolve) => {

        // only run this once per session of vscode
        if (checkedVersions !== true) {
            checkedVersions = true;

            // first check the main cli version
            const command = new SystemCommand('ibmcloud', ['--version']);
            command.execute()
                .then(function() {
                    if (command.stdout !== undefined) {

                        // parse version from ibmcloud --version command output
                        const split = command.stdout.split('+');
                        const detail = split[0].split('version');
                        const version = semver.clean(detail[detail.length - 1]);

                        if (semver.gt(packageJson.ibm.cli.version, version)) {
                            const message = `\n\nThe recommended minimum IBM Cloud CLI version is ${packageJson.ibm.cli.version}.\nYour system is currently running ${version}.\nA newer version of the IBM Cloud CLI is available for download at: ${packageJson.ibm.cli.url}`;
                            outputChannel.append(message);
                        }
                    }
                })
                .then(function() {

                    // next check the plugin versions
                    // list all plugins with version using `ibmcloud plugin list command`
                    const pluginsListCommand = new SystemCommand('ibmcloud', ['plugin', 'list']);
                    pluginsListCommand.execute()
                        .then(function() {
                            if (pluginsListCommand.stdout !== undefined) {
                                const lines = pluginsListCommand.stdout.split('\n');

                                // skip first three lines (heading lines)
                                for (let x = 3; x < lines.length; x++) {
                                    if (lines.length > 0) {

                                        if (lines.length > 0) {
                                            const line = lines[x];
                                            const displayName = line.substr(0, 20).trim();
                                            const pluginVersion = line.substr(20).trim();
                                            const cleanVersion = semver.clean(pluginVersion);

                                            if (cleanVersion !== null) {
                                                for (const plugin of packageJson.ibm.plugins) {
                                                    // loop over plugins and find match based on name
                                                    if (displayName.search(plugin.displayName) >= 0) {
                                                        if (semver.gt(plugin.version, cleanVersion)) {
                                                            const message = `\n\nThe recommended minimum version for the IBM Cloud '${plugin.displayName}' CLI plugin is ${plugin.version}.\nYour system is currently running ${cleanVersion}.\nYou can update using the 'ibmcloud plugin update' command or visit ${plugin.url}`;
                                                            outputChannel.append(message);
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            resolve();
                        });

                });
        } else {
            resolve();
        }
    });
}

/* this method is called when your extension is deactivated
*/
export function deactivate() { } //eslint-disable-line @typescript-eslint/no-empty-function
