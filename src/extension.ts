'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {SystemCommand} from './SystemCommand';
import {PromptInput, PromptingCommand} from './PromptingCommand';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "com-ibm-bluemix" is now active!');

    let outputChannel = vscode.window.createOutputChannel("Bluemix");
    
    // bx dev commands *************************************
    // not implemented from bx dev cli: code, create, delete
    regCommand(context, 'extension.bx.dev.list', {cmd:'bx', args:['dev', 'list']}, outputChannel);
    regCommand(context, 'extension.bx.dev.build', {cmd:'bx', args:['dev', 'build']},outputChannel);
    regCommand(context, 'extension.bx.dev.debug', {cmd:'bx', args:['dev', 'debug']},outputChannel);
    regCommand(context, 'extension.bx.dev.deploy', {cmd:'bx', args:['dev', 'deploy']},outputChannel);
    regCommand(context, 'extension.bx.dev.run', {cmd:'bx', args:['dev', 'run']},outputChannel);
    regCommand(context, 'extension.bx.dev.status', {cmd:'bx', args:['dev', 'status']},outputChannel);
    regCommand(context, 'extension.bx.dev.stop', {cmd: 'bx', args:['dev', 'stop']},outputChannel);
    regCommand(context, 'extension.bx.dev.test', {cmd:'bx', args:['dev', 'test']},outputChannel);

    // bx cs commands *************************************
    regPromptingCommand(context, 'extension.bx.cs.cluster-create', {cmd:'bx', args:['cs', 'cluster-create']},outputChannel, [new PromptInput('Specify a cluster name', '--name')], []);
    regCommand(context, 'extension.bx.cs.clusters', {cmd:'bx', args:['cs', 'clusters']},outputChannel);
    regCommand(context, 'extension.bx.cs.init', {cmd:'bx', args:['cs', 'init']},outputChannel);
    regPromptingCommand(context, 'extension.bx.cs.worker-get', {cmd:'bx', args:['cs', 'worker-get']},outputChannel, [new PromptInput('Specify worker id')] );
    regPromptingCommand(context, 'extension.bx.cs.worker-reboot', {cmd:'bx', args:['cs', 'worker-reboot']},outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    regPromptingCommand(context, 'extension.bx.cs.worker-reload', {cmd:'bx', args:['cs', 'worker-reload']},outputChannel, [new PromptInput('Specify a cluster name or id'), new PromptInput('Specify a worker id')], ['-f'] );
    regPromptingCommand(context, 'extension.bx.cs.workers', {cmd:'bx', args:['cs', 'workers']},outputChannel, [new PromptInput('Specify a cluster name or id')] );
}

function regCommand(context: vscode.ExtensionContext, key:string, opt, outputChannel) {
    let disposable = vscode.commands.registerCommand(key, () => {
        var command = new SystemCommand(opt.cmd, opt.args, outputChannel);
        command.execute();
    });
    context.subscriptions.push(disposable);
}

function regPromptingCommand(context: vscode.ExtensionContext, key:string, opt, outputChannel, inputs:PromptInput[], additionalArgs:string[] = [] ) {
    let disposable = vscode.commands.registerCommand(key, () => {
        var command = new PromptingCommand(opt.cmd, opt.args, outputChannel, inputs, additionalArgs);
        command.execute();
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}