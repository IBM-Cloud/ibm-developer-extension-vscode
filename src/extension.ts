'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {SystemCommand} from './SystemCommand';
import {PromptInput, PromptingCommand} from './PromptingCommand';
import {LogsCommandManager} from './cloudfoundry/LogsCommandManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "com-ibm-bluemix" is now active!');

    let outputChannel = vscode.window.createOutputChannel("Bluemix");
    
    // BX DEV commands *************************************
    // not implemented from bx dev cli: code, create, delete
    registerCommand(context, 'extension.bx.dev.list', {cmd:'bx', args:['dev', 'list']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.build', {cmd:'bx', args:['dev', 'build']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.debug', {cmd:'bx', args:['dev', 'debug']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.deploy', {cmd:'bx', args:['dev', 'deploy']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.run', {cmd:'bx', args:['dev', 'run']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.status', {cmd:'bx', args:['dev', 'status']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.stop', {cmd: 'bx', args:['dev', 'stop']}, outputChannel);
    registerCommand(context, 'extension.bx.dev.test', {cmd:'bx', args:['dev', 'test']}, outputChannel);


    // bx CF commands *************************************
    registerCommand(context, 'extension.bx.cf.apps', {cmd:'bx', args:['cf', 'apps']}, outputChannel);
    registerPromptingCommand(context, 'extension.bx.cf.app', {cmd:'bx', args:['cf', 'app']}, outputChannel, [new PromptInput('Specify an app name')], []);
    registerPromptingCommand(context, 'extension.bx.cf.create-app-manifest', {cmd:'bx', args:['cf', 'create-app-manifest']}, outputChannel, [new PromptInput('Specify an app name')], []);
    registerCommand(context, 'extension.bx.cf.push', {cmd:'bx', args:['cf', 'push']}, outputChannel);
    registerPromptingCommand(context, 'extension.bx.cf.push-appname', {cmd:'bx', args:['cf', 'push']}, outputChannel, [new PromptInput('Specify an app name')], []);
    registerPromptingCommand(context, 'extension.bx.cf.start', {cmd:'bx', args:['cf', 'start']}, outputChannel, [new PromptInput('Specify an app name')], []);
    registerPromptingCommand(context, 'extension.bx.cf.stop', {cmd:'bx', args:['cf', 'stop']}, outputChannel, [new PromptInput('Specify an app name')], []);
    registerPromptingCommand(context, 'extension.bx.cf.restart', {cmd:'bx', args:['cf', 'restart']}, outputChannel, [new PromptInput('Specify an app name')], []);
    registerPromptingCommand(context, 'extension.bx.cf.restage', {cmd:'bx', args:['cf', 'restage']}, outputChannel, [new PromptInput('Specify an app name')], []);
    registerPromptingCommand(context, 'extension.bx.cf.events', {cmd:'bx', args:['cf', 'events']}, outputChannel, [new PromptInput('Specify an app name')], []);
    registerPromptingCommand(context, 'extension.bx.cf.env', {cmd:'bx', args:['cf', 'env']}, outputChannel, [new PromptInput('Specify an app name')], []);
    
    LogsCommandManager.registerCommand(context, 'extension.bx.cf.logs');
    LogsCommandManager.registerCommand(context, 'extension.bx.cf.logs-stop');

    //registerPromptingCommand(context, 'extension.bx.cf.logs', {cmd:'bx', args:['cf', 'logs']}, outputChannel, [new PromptInput('Specify an app name')], []);


    // BX CS commands *************************************
    registerPromptingCommand(context, 'extension.bx.cs.cluster-create', {cmd:'bx', args:['cs', 'cluster-create']}, outputChannel, [new PromptInput('Specify a cluster name', '--name')], []);
    registerPromptingCommand(context, 'extension.bx.cs.cluster-get', {cmd:'bx', args:['cs', 'cluster-get']}, outputChannel, [new PromptInput('Specify a cluster name or id')], []);
    registerPromptingCommand(context, 'extension.bx.cs.cluster-rm', {cmd:'bx', args:['cs', 'cluster-rm']}, outputChannel, [new PromptInput('Specify a cluster name or id')], ['-f']);
    registerCommand(context, 'extension.bx.cs.clusters', {cmd:'bx', args:['cs', 'clusters']}, outputChannel);
    registerCommand(context, 'extension.bx.cs.init', {cmd:'bx', args:['cs', 'init']}, outputChannel);
    registerPromptingCommand(context, 'extension.bx.cs.worker-get', {cmd:'bx', args:['cs', 'worker-get']}, outputChannel, [new PromptInput('Specify worker id')] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-reboot', {cmd:'bx', args:['cs', 'worker-reboot']}, outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.bx.cs.worker-reload', {cmd:'bx', args:['cs', 'worker-reload']}, outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    registerPromptingCommand(context, 'extension.bx.cs.workers', {cmd:'bx', args:['cs', 'workers']}, outputChannel, [new PromptInput('Specify a cluster name or id')] );
}

function registerCommand(context: vscode.ExtensionContext, key:string, opt, outputChannel) {
    let disposable = vscode.commands.registerCommand(key, () => {
        var command = new SystemCommand(opt.cmd, opt.args, outputChannel);
        command.execute();
    });
    context.subscriptions.push(disposable);
}

function registerPromptingCommand(context: vscode.ExtensionContext, key:string, opt, outputChannel, inputs:PromptInput[], additionalArgs:string[] = [] ) {
    let disposable = vscode.commands.registerCommand(key, () => {
        var command = new PromptingCommand(opt.cmd, opt.args, outputChannel, inputs, additionalArgs);
        command.execute();
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}