/**
 * Copyright IBM Corporation 2016, 2017
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


const outputChannel = window.createOutputChannel('Bluemix');
let checkedVersions = false;
let unsupportedDevVersion = false;

/*
 * activate method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 */
export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "com-ibm-bluemix" is now active!');

    LoginManager.registerCommand(context, 'extension.bx.login');
    LoginManager.registerCommand(context, 'extension.bx.login.sso');
    registerCommand(context, 'extension.bx.logout', {cmd: 'bx', args: ['logout']}, outputChannel);
    registerCommand(context, 'extension.bx.cli-update', {cmd: 'bx', args: ['plugin', 'update', '-r', 'Bluemix']}, outputChannel);


    // BX DEV commands *************************************
    registerCommand(context, 'extension.bx.dev.list', {cmd: 'bx', args: ['dev', 'list']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.build', {cmd: 'bx', args: ['dev', 'build', '--debug']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.build.release', {cmd: 'bx', args: ['dev', 'build']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.debug', {cmd: 'bx', args: ['dev', 'debug']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.deploy', {cmd: 'bx', args: ['dev', 'deploy', '--trace']}, outputChannel, DeployCommand);
    registerCommand(context, 'extension.bx.dev.run', {cmd: 'bx', args: ['dev', 'run']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.status', {cmd: 'bx', args: ['dev', 'status']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.stop', {cmd: 'bx', args: ['dev', 'stop']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.test', {cmd: 'bx', args: ['dev', 'test']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.console', {cmd: 'bx', args: ['dev', 'console']}, outputChannel);
    registerPromptingCommand(context, 'extension.bx.dev.console.app', {cmd: 'bx', args: ['dev', 'console']}, outputChannel, [new PromptInput('Specify a project name')]);
    registerCommand(context, 'extension.bx.dev.shell', {cmd: 'bx', args: ['dev', 'shell']}, outputChannel, SystemCommand, true);
    registerCommand(context, 'extension.bx.dev.shell.run', {cmd: 'bx', args: ['dev', 'shell', 'run']}, outputChannel, SystemCommand, true);
    registerCommand(context, 'extension.bx.dev.shell.tools', {cmd: 'bx', args: ['dev', 'shell', 'tools']}, outputChannel, SystemCommand, true);


    // bx CF commands *************************************
    registerCommand(context, 'extension.bx.cf.apps', {cmd: 'bx', args: ['cf', 'apps']}, outputChannel);
    registerPromptingCommand(context, 'extension.bx.cf.app', {cmd: 'bx', args: ['cf', 'app']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.bx.cf.create-app-manifest', {cmd: 'bx', args: ['cf', 'create-app-manifest']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerCommand(context, 'extension.bx.cf.push', {cmd: 'bx', args: ['cf', 'push']}, outputChannel);
    registerPromptingCommand(context, 'extension.bx.cf.push-appname', {cmd: 'bx', args: ['cf', 'push']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.bx.cf.start', {cmd: 'bx', args: ['cf', 'start']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.bx.cf.stop', {cmd: 'bx', args: ['cf', 'stop']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.bx.cf.restart', {cmd: 'bx', args: ['cf', 'restart']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.bx.cf.restage', {cmd: 'bx', args: ['cf', 'restage']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.bx.cf.events', {cmd: 'bx', args: ['cf', 'events']}, outputChannel, [new PromptInput('Specify an app name')]);
    registerPromptingCommand(context, 'extension.bx.cf.env', {cmd: 'bx', args: ['cf', 'env']}, outputChannel, [new PromptInput('Specify an app name')]);
    LogsCommandManager.registerCommand(context, 'extension.bx.cf.logs');
    LogsCommandManager.registerCommand(context, 'extension.bx.cf.logs-stop');



    // BX CS commands *************************************
    registerPromptingCommand(context, 'extension.bx.cs.cluster-create', {cmd: 'bx', args: ['cs', 'cluster-create']}, outputChannel, [new PromptInput('Specify a cluster name', '--name')]);
    registerPromptingCommand(context, 'extension.bx.cs.cluster-get', {cmd: 'bx', args: ['cs', 'cluster-get']}, outputChannel, [new PromptInput('Specify a cluster name or id')]);
    registerPromptingCommand(context, 'extension.bx.cs.cluster-rm', {cmd: 'bx', args: ['cs', 'cluster-rm']}, outputChannel, [new PromptInput('Specify a cluster name or id')], ['-f']);
    registerPromptingCommand(context, 'extension.bx.cs.cluster-config', {cmd: 'bx', args: ['cs', 'cluster-config']}, outputChannel, [new PromptInput('Specify a cluster name or id')]);
    registerCommand(context, 'extension.bx.cs.clusters', {cmd: 'bx', args: ['cs', 'clusters']}, outputChannel);
    registerCommand(context, 'extension.bx.cs.init', {cmd: 'bx', args: ['cs', 'init']}, outputChannel);
    registerPromptingCommand(context, 'extension.bx.cs.worker-get', {cmd: 'bx', args: ['cs', 'worker-get']}, outputChannel, [new PromptInput('Specify worker id')] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-add', {cmd: 'bx', args: ['cs', 'worker-add']}, outputChannel, [new PromptInput('Specify cluster name or id')], ['1'] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-reboot', {cmd: 'bx', args: ['cs', 'worker-reboot']}, outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-reload', {cmd: 'bx', args: ['cs', 'worker-reload']}, outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-rm', {cmd: 'bx', args: ['cs', 'worker-rm']}, outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.bx.cs.workers', {cmd: 'bx', args: ['cs', 'workers']}, outputChannel, [new PromptInput('Specify a cluster name or id')] );
}



/*
 *  Helper utility to register system commands
 */
function registerCommand(context: ExtensionContext, key: string, opt, outputChannel, CommandClass = SystemCommand, useTerminal: boolean = false) {
    const disposable = commands.registerCommand(key, () => {
        const command = new CommandClass(opt.cmd, opt.args, outputChannel);
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
function registerPromptingCommand(context: ExtensionContext, key: string, opt, outputChannel, inputs: PromptInput[], additionalArgs: string[] = []) {
    const disposable = commands.registerCommand(key, () => {
        const command = new PromptingCommand(opt.cmd, opt.args, outputChannel, inputs, additionalArgs);
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
 *  Checks the version of the Bluemix CLI and notifies the user if cli or recommended plugins are out of date
 */
function checkVersions(): Promise<any> {

    return new Promise<any>((resolve, reject) => {

        // only run this once per session of vscode
        if (checkedVersions !== true) {
            checkedVersions = true;

            // first check the main cli version
            const command = new SystemCommand('bx', ['--version']);
            command.execute()
            .then(function() {
                if (command.stdout !== undefined) {

                    // parse version from bx --version command output
                    const split = command.stdout.split('+');
                    const detail = split[0].split('version');
                    const version = semver.clean(detail[detail.length - 1]);

                    if (semver.gt(packageJson.ibm.cli.version, version)) {
                        const message = `\n\nThe recommended minimum Bluemix CLI version is ${packageJson.ibm.cli.version}.\nYour system is currently running ${version}.\nA newer version of the IBM Bluemix CLI is available for download at: ${packageJson.ibm.cli.url}`;
                        outputChannel.append(message);
                    }
                }
            })
            .then(function() {

                // next check the plugin versions
                // list all plugins with version using `bx plugin list command`
                const pluginsListCommand = new SystemCommand('bx', ['plugin', 'list']);
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
                                                    const message = `\n\nThe recommended minimum version for the Bluemix '${plugin.displayName}' CLI plugin is ${plugin.version}.\nYour system is currently running ${cleanVersion}.\nYou ${ devPlugin ? 'must' : 'can' } update using the 'bx plugin update' command or visit ${plugin.url}`;
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
