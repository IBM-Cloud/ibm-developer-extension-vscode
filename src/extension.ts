'use strict';

import {commands, window, workspace, ExtensionContext} from 'vscode';
import {LogsCommandManager} from './cloudfoundry/LogsCommandManager';
import {LoginManager} from './util/LoginManager';
import {PromptingCommand, PromptInput} from './util/PromptingCommand';
import {SystemCommand} from './util/SystemCommand';
const semver = require('semver');
const packageJson = require('../../package.json');
const fs = require('fs');


const outputChannel = window.createOutputChannel('Bluemix');
let checkedVersions = false;

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
    registerCommand(context, 'extension.bx.dev.list', {cmd: 'bx', args: ['dev', 'list']}, outputChannel, true);
    registerCommand(context, 'extension.bx.dev.build', {cmd: 'bx', args: ['dev', 'build']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.debug', {cmd: 'bx', args: ['dev', 'debug']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.deploy', {cmd: 'bx', args: ['dev', 'deploy']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.run', {cmd: 'bx', args: ['dev', 'run']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.status', {cmd: 'bx', args: ['dev', 'status']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.stop', {cmd: 'bx', args: ['dev', 'stop']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.test', {cmd: 'bx', args: ['dev', 'test']}, outputChannel);


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



    // BX SDK commands *************************************
    registerPromptingCommand(context, 'extension.bx.sdk.generate', {cmd: 'bx', args: ['sdk', 'generate']}, outputChannel, [new PromptInput('Specify target app name'), new PromptInput('Select target platform', undefined, ['--android', '--ios', '--swift'])], [], true);
    registerCommand(context, 'extension.bx.sdk.list', {cmd: 'bx', args: ['sdk', 'list']}, outputChannel, true);
    registerPromptingCommand(context, 'extension.bx.sdk.validate', {cmd: 'bx', args: ['sdk', 'validate']}, outputChannel, [new PromptInput('Specify target app name')], [], true);



    // BX CS commands *************************************
    registerPromptingCommand(context, 'extension.bx.cs.cluster-create', {cmd: 'bx', args: ['cs', 'cluster-create']}, outputChannel, [new PromptInput('Specify a cluster name', '--name')]);
    registerPromptingCommand(context, 'extension.bx.cs.cluster-get', {cmd: 'bx', args: ['cs', 'cluster-get']}, outputChannel, [new PromptInput('Specify a cluster name or id')]);
    registerPromptingCommand(context, 'extension.bx.cs.cluster-rm', {cmd: 'bx', args: ['cs', 'cluster-rm']}, outputChannel, [new PromptInput('Specify a cluster name or id')], ['-f']);
    registerCommand(context, 'extension.bx.cs.clusters', {cmd: 'bx', args: ['cs', 'clusters']}, outputChannel);
    registerCommand(context, 'extension.bx.cs.init', {cmd: 'bx', args: ['cs', 'init']}, outputChannel);
    registerPromptingCommand(context, 'extension.bx.cs.worker-get', {cmd: 'bx', args: ['cs', 'worker-get']}, outputChannel, [new PromptInput('Specify worker id')] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-add', {cmd: 'bx', args: ['cs', 'worker-add']}, outputChannel, [new PromptInput('Specify cluster name or id')], ['1'] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-reboot', {cmd: 'bx', args: ['cs', 'worker-reboot']}, outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-reload', {cmd: 'bx', args: ['cs', 'worker-reload']}, outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-rm', {cmd: 'bx', args: ['cs', 'worker-rm']}, outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.bx.cs.workers', {cmd: 'bx', args: ['cs', 'workers']}, outputChannel, [new PromptInput('Specify a cluster name or id')] );




    // EXPERIMENTAL DEPLOY TO KUBE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    const disposable = commands.registerCommand('extension.bx.dev.deploy-kubernetes', () => {

        outputChannel.show();
        outputChannel.append('\nDeploying to IBM Containers (Kubernetes)...');

        if (workspace.rootPath !== undefined) {
            const deployScript = 'deploy-to-kube.sh';
            const deployScriptPath = `${workspace.rootPath}/${deployScript}`;
            const deployYamlPath = `${workspace.rootPath}/kube-deployment.yaml`;
            const allInOneYamlPath = `${workspace.rootPath}/kube-all-in-one.yaml`;
            if (fs.existsSync(deployScriptPath)) {

                const getClusterConfig = function() {

                    window.showInputBox({prompt: 'Cluster name'}).then(
                        function(cluster) {
                            if (cluster !== undefined && cluster.length > 0) {
                                const clusterConfigCommand = new SystemCommand('bx', ['cs', 'cluster-config', cluster], undefined, false);
                                clusterConfigCommand.execute()
                                .then(function() {

                                    const tokens = clusterConfigCommand.stdout.split('export');
                                    // see KUBECONFIG == console.log(tokens[tokens.length-1]);

                                    if (clusterConfigCommand.stdout.search('FAILED') >= 0) {
                                        outputChannel.append(`\nERROR: Invalid cluster or the client is not yet configured. Run 'bx login' and make sure your clustername is valid.`);
                                    }
                                    else {

                                        let deployScriptContents = fs.readFileSync(deployScriptPath, 'utf8');
                                        deployScriptContents = deployScriptContents.replace( /#BEGINCONFIG[\s\S]*ENDCONFIG/g, '');
                                        deployScriptContents = '#BEGINCONFIG\nexport' + tokens[tokens.length - 1] + '#ENDCONFIG\n' + deployScriptContents;
                                        fs.writeFileSync(deployScriptPath, deployScriptContents);
                                        deploy();
                                    }

                                });
                            }
                        });
                };



                const deploy = function() {
                    // add execute permission (in some cases users won't have it after extracting zip)
                    const permissionsCommand = new SystemCommand('chmod', ['+x', deployScriptPath], undefined, false);
                    permissionsCommand.execute()
                    .then(function() {
                        console.log('complete');

                        console.log(`executing ${deployScript}`);
                        const deployCommand = new SystemCommand(deployScriptPath, [], outputChannel, false);
                        // deployCommand.useTerminal = true;
                        deployCommand.execute()
                        .then(function() {
                            console.log('complete');

                            outputChannel.show();
                            outputChannel.append(`\SUCCESS: Deployment to IBM Containers (Kubernetes) complete`);
                        });
                    });
                };

                console.log(`changing permissions +x for ${deployScript}`);

                const replaceString = 'antonal';

                let deployScriptContents = fs.readFileSync(deployScriptPath, 'utf8');
                if (deployScriptContents.indexOf(replaceString) >= 0) {

                    window.showInputBox({prompt: 'IBM Container Registry namespace'}).then(
                        function(namespace) {
                            if (namespace !== undefined && namespace.length > 0) {

                                deployScriptContents = deployScriptContents.replace(new RegExp(replaceString, 'g'), namespace);
                                fs.writeFileSync(deployScriptPath, deployScriptContents);

                                let deployYamlContents = fs.readFileSync(deployYamlPath, 'utf8');
                                deployYamlContents = deployYamlContents.replace(new RegExp(replaceString, 'g'), namespace);
                                fs.writeFileSync(deployYamlPath, deployYamlContents);

                                let allInOneYamlContents = fs.readFileSync(allInOneYamlPath, 'utf8');
                                allInOneYamlContents = allInOneYamlContents.replace(new RegExp(replaceString, 'g'), namespace);
                                fs.writeFileSync(allInOneYamlPath, allInOneYamlContents);

                                getClusterConfig();

                            } else {
                                outputChannel.append(`\nERROR: Please enter a valid IBM Container Registry namespace.`);
                            }

                        },
                    );
                } else {
                    getClusterConfig();
                }
            }
            else {
                outputChannel.append(`\nERROR: Unable to locate ${deployScript} in project folder.`);
            }
        }
        else {
            outputChannel.append(`\nERROR: Please select a project folder.`);
        }

    });
    context.subscriptions.push(disposable);
}



/*
 *  Helper utility to register system commands
 */
function registerCommand(context: ExtensionContext, key: string, opt, outputChannel, sanitizeOutput: boolean = false) {
    const disposable = commands.registerCommand(key, () => {
        const command = new SystemCommand(opt.cmd, opt.args, outputChannel, sanitizeOutput);
        command.execute()
        .then(checkVersions);
    });
    context.subscriptions.push(disposable);
}


/*
 *  Helper utility to register prompting system commands
 */
function registerPromptingCommand(context: ExtensionContext, key: string, opt, outputChannel, inputs: PromptInput[], additionalArgs: string[] = [], sanitizeOutput: boolean = false) {
    const disposable = commands.registerCommand(key, () => {
        const command = new PromptingCommand(opt.cmd, opt.args, outputChannel, inputs, additionalArgs, sanitizeOutput);
        command.execute()
        .then(checkVersions);
    });
    context.subscriptions.push(disposable);
}


/*
 *  Checks the version of the Bluemix CLI and notifies the user if cli or recommended plugins are out of date
 */
function checkVersions(code) {

    // only run this once per session of vscode, and only if executed successfully (return code >= 0)
    if (code >= 0 && checkedVersions !== true) {
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
                                                const message = `\n\nThe recommended minimum version for the Bluemix '${plugin.displayName}' CLI plugin is ${plugin.version}.\nYour system is currently running ${cleanVersion}.\nYou can update using the 'bx plugin update' command or visit ${plugin.url}`;
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
            });

        });
    }
}

/*
 * this method is called when your extension is deactivated
 */
export function deactivate() {
}