/**
 * Copyright IBM Corporation 2016, 2021
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

import {commands, window, ExtensionContext} from 'vscode';
import {LogsCommandManager} from './cloudfoundry/LogsCommandManager';
import {DeployCommand} from './util/DeployCommand';
import {LoginManager} from './util/LoginManager';
import {PromptingCommand, PromptInput} from './util/PromptingCommand';
import {SystemCommand} from './util/SystemCommand';
const semver = require('semver');
const packageJson = require('../../package.json');


const outputChannel = window.createOutputChannel('IBMCloud');
let checkedVersions = false;
let unsupportedDevVersion = false;

/*
 * activate method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 */
export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "com-ibm-cloud" is now active!');

    LoginManager.registerCommand(context, 'extension.ibmcloud.login');
    LoginManager.registerCommand(context, 'extension.ibmcloud.login.sso');
    registerCommand(context, 'extension.ibmcloud.logout', {cmd: 'ibmcloud', args: ['logout']}, outputChannel);
    registerCommand(context, 'extension.ibmcloud.cli-update', {cmd: 'ibmcloud', args: ['plugin', 'update', '-r', 'IBMCloud']}, outputChannel);


    // IBMCloud DEV commands *************************************
    registerCommand(context, 'extension.ibmcloud.dev.list', {cmd: 'ibmcloud', args: ['dev', 'list', '--caller-vscode']}, outputChannel, true);
    registerCommand(context, 'extension.ibmcloud.dev.create', {cmd: 'ibmcloud', args: ['dev', 'create', '--caller-vscode']}, outputChannel, true, SystemCommand, true);
    registerCommand(context, 'extension.ibmcloud.dev.build', {cmd: 'ibmcloud', args: ['dev', 'build', '--caller-vscode', '--debug']}, outputChannel, true);
    registerCommand(context, 'extension.ibmcloud.dev.build.release', {cmd: 'ibmcloud', args: ['dev', 'build', '--caller-vscode']}, outputChannel, true);
    registerCommand(context, 'extension.ibmcloud.dev.debug', {cmd: 'ibmcloud', args: ['dev', 'debug', '--caller-vscode']}, outputChannel);
    registerCommand(context, 'extension.ibmcloud.dev.deploy', {cmd: 'ibmcloud', args: ['dev', 'deploy', '--caller-vscode', '--trace']}, outputChannel, false, DeployCommand);
    registerCommand(context, 'extension.ibmcloud.dev.diag', {cmd: 'ibmcloud', args: ['dev', 'diag', '--caller-vscode', '--trace']}, outputChannel, true);
    registerCommand(context, 'extension.ibmcloud.dev.run', {cmd: 'ibmcloud', args: ['dev', 'run', '--caller-vscode']}, outputChannel);
    registerCommand(context, 'extension.ibmcloud.dev.status', {cmd: 'ibmcloud', args: ['dev', 'status', '--caller-vscode']}, outputChannel);
    registerCommand(context, 'extension.ibmcloud.dev.stop', {cmd: 'ibmcloud', args: ['dev', 'stop', '--caller-vscode']}, outputChannel);
    registerCommand(context, 'extension.ibmcloud.dev.test', {cmd: 'ibmcloud', args: ['dev', 'test', '--caller-vscode']}, outputChannel);
    registerCommand(context, 'extension.ibmcloud.dev.console', {cmd: 'ibmcloud', args: ['dev', 'console', '--caller-vscode']}, outputChannel);
    registerCommand(context, 'extension.ibmcloud.dev.view', {cmd: 'ibmcloud', args: ['dev', 'view', '--caller-vscode']}, outputChannel, true, SystemCommand, true);
    registerPromptingCommand(context, 'extension.ibmcloud.dev.console.app', {cmd: 'ibmcloud', args: ['dev', 'console', '--caller-vscode']}, outputChannel, [new PromptInput('Specify a project name')]);
    registerCommand(context, 'extension.ibmcloud.dev.shell', {cmd: 'ibmcloud', args: ['dev', 'shell', '--caller-vscode']}, outputChannel, false, SystemCommand, true);
    registerCommand(context, 'extension.ibmcloud.dev.shell.run', {cmd: 'ibmcloud', args: ['dev', 'shell', 'run', '--caller-vscode']}, outputChannel, false, SystemCommand, true);
    registerCommand(context, 'extension.ibmcloud.dev.shell.tools', {cmd: 'ibmcloud', args: ['dev', 'shell', 'tools', '--caller-vscode']}, outputChannel, false, SystemCommand, true);


    // IBMCloud CF commands *************************************
    registerCommand(context, 'extension.ibmcloud.cf.apps', {cmd: 'ibmcloud', args: ['cf', 'apps']}, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.app', {cmd: 'ibmcloud', args: ['cf', 'app']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.create-app-manifest', {cmd: 'ibmcloud', args: ['cf', 'create-app-manifest']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerCommand(context, 'extension.ibmcloud.cf.push', {cmd: 'ibmcloud', args: ['cf', 'push']}, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.push-appname', {cmd: 'ibmcloud', args: ['cf', 'push']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.start', {cmd: 'ibmcloud', args: ['cf', 'start']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.stop', {cmd: 'ibmcloud', args: ['cf', 'stop']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.restart', {cmd: 'ibmcloud', args: ['cf', 'restart']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.restage', {cmd: 'ibmcloud', args: ['cf', 'restage']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.events', {cmd: 'ibmcloud', args: ['cf', 'events']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cf.env', {cmd: 'ibmcloud', args: ['cf', 'env']}, outputChannel, [new PromptInput('Specify an app name')]);
    LogsCommandManager.registerCommand(context, 'extension.ibmcloud.cf.logs');
    LogsCommandManager.registerCommand(context, 'extension.ibmcloud.cf.logs-stop');



    // IBMCloud CS commands *************************************
    registerPromptingCommand(context, 'extension.ibmcloud.cs.cluster.get', {cmd: 'ibmcloud', args: ['cs', 'cluster', 'get']}, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cs.cluster.rm', {cmd: 'ibmcloud', args: ['cs', 'cluster', 'rm']}, outputChannel, [new PromptInput('Specify a cluster name or id')], ['-f']);
    registerCommand(context, 'extension.ibmcloud.cs.clusters', {cmd: 'ibmcloud', args: ['cs', 'clusters']}, outputChannel);
    registerCommand(context, 'extension.ibmcloud.cs.init', {cmd: 'ibmcloud', args: ['cs', 'init']}, outputChannel);
    registerPromptingCommand(context, 'extension.ibmcloud.cs.worker.get',  {cmd: 'ibmcloud', args: ['cs', 'worker', 'get']}, outputChannel, [new PromptInput('Specify cluster name or id', '--cluster'), new PromptInput('Specify worker id', '--worker')]);
    registerPromptingCommand(context, 'extension.ibmcloud.cs.worker.add', {cmd: 'ibmcloud', args: ['cs', 'worker' ,'add']}, outputChannel, [new PromptInput('Specify cluster name or id', '--cluster')], ['1'] );
    registerPromptingCommand(context, 'extension.ibmcloud.cs.worker.reboot', {cmd: 'ibmcloud', args: ['cs', 'worker', 'reboot']}, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster'), new PromptInput('Specify a worker id', '--worker')], ['-f'] );
    registerPromptingCommand(context, 'extension.ibmcloud.cs.worker.reload', {cmd: 'ibmcloud', args: ['cs', 'worker', 'reload']}, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster'), new PromptInput('Specify a worker id', '--worker')], ['-f'] );
    registerPromptingCommand(context, 'extension.ibmcloud.cs.worker.rm', {cmd: 'ibmcloud', args: ['cs', 'worker', 'rm']}, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.ibmcloud.cs.workers', {cmd: 'ibmcloud', args: ['cs', 'workers']}, outputChannel, [new PromptInput('Specify a cluster name or id', '--cluster')] );
}



/*
 *  Helper utility to register system commands
 */
function registerCommand(context: ExtensionContext, key: string, opt, outputChannel, sanitizeOutput: boolean = false, CommandClass = SystemCommand, useTerminal: boolean = false) {
    const disposable = commands.registerCommand(key, () => {
        const command = new CommandClass(opt.cmd, opt.args, outputChannel, sanitizeOutput);
        command.useTerminal = useTerminal;
        checkVersions().then(function() {
            executeCommand(command);
        });
    });
    context.subscriptions.push(disposable);
}


/*
 *  Helper utility to register prompting system commands
 */
function registerPromptingCommand(context: ExtensionContext, key: string, opt, outputChannel, inputs: PromptInput[], additionalArgs: string[] = [], sanitizeOutput: boolean = false) {
    const disposable = commands.registerCommand(key, () => {
        const command = new PromptingCommand(opt.cmd, opt.args, outputChannel, inputs, additionalArgs, sanitizeOutput);
        checkVersions().then(function() {
            executeCommand(command);
        });
    });
    context.subscriptions.push(disposable);
}


function executeCommand(command: SystemCommand) {

    const targetPlugin = command.args[0];
    if (targetPlugin === 'dev' && unsupportedDevVersion === true) {
        const message = `\n\nExecution blocked. You must update you 'dev' extension to the minimum supported version.`;
        outputChannel.append(message);
        return;
    }
    command.execute();
}


/*
 *  Checks the version of the IBMCloud CLI and notifies the user if cli or recommended plugins are out of date
 */
function checkVersions(): Promise<any> {

    return new Promise<any>((resolve, reject) => {

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
                        const message = `\n\nThe recommended minimum IBMCloud CLI version is ${packageJson.ibm.cli.version}.\nYour system is currently running ${version}.\nA newer version of the IBMCloud CLI is available for download at: ${packageJson.ibm.cli.url}`;
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
                                                    const devPlugin = plugin.command === 'dev';
                                                    const message = `\n\nThe recommended minimum version for the IBMCloud '${plugin.displayName}' CLI plugin is ${plugin.version}.\nYour system is currently running ${cleanVersion}.\nYou ${ devPlugin ? 'must' : 'can' } update using the 'ibmcloud plugin update' command or visit ${plugin.url}`;
                                                    outputChannel.append(message);

                                                    if (devPlugin) {
                                                        unsupportedDevVersion = true;
                                                    }
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

/*
 * this method is called when your extension is deactivated
 */
export function deactivate() {
}
