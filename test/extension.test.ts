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

// The module 'assert' provides assertion methods from node
import { assert } from 'chai';
import * as sinon from 'sinon';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {IBMCloudTerminal} from '../src/util/IBMCloudTerminal';
import {SystemCommand} from '../src/util/SystemCommand';
import * as resource from '../src/ibmcloud/resource';
import * as packageJson from '../package.json';
import {getServiceIds} from '../src/ibmcloud/iam';
import * as plugin from '../src/ibmcloud/plugin';
import {CONFIRM_NO, CONFIRM_YES} from '../src/consts';

// Defines a Mocha test suite to group tests of similar kind together
function logStub(cmd:string, outputChannel:sinon.SinonStub) {
    console.log(`\n================================(${cmd})================================`);
    outputChannel.args.forEach((arg:any) => {
        if (Array.isArray(arg) && arg.length > 0) console.log(arg[0]);
    });
    console.log(`\n================================(${cmd})================================`);
}

describe('Extension Tests', function () {
	describe('System Commands', function () {

		context('when executing a system command', function() {

			it('should run successfully when executing a valid command', async function () {
				const command = new SystemCommand('ls', ['-l', '-a']);
				const statusCode = await command.execute();
				assert.equal(0, statusCode);
			});

			it('should fail when executing an invalid command', async function () {
				const command = new SystemCommand('foo');
				const statusCode = await command.execute();
				assert.notEqual(0, statusCode);
			});
		});
	});

    describe('IBM Cloud CLI Commands', function () {
        this.timeout(15000);
        const extensionName = `${packageJson.publisher}.${packageJson.name}`;
        let extension: any;
        let outputChannel:sinon.SinonStub;
        let showQuickPick:sinon.SinonStub;
        let showInputBox:sinon.SinonStub;
        let sendTerminalText:sinon.SinonSpy;
        let showWarningMessage:sinon.SinonSpy;
        let showTerminal:sinon.SinonSpy;
        const sandbox = sinon.createSandbox();

        before(async function () {		
            extension = vscode.extensions.getExtension(extensionName);
            if (extension) {
                await extension.activate();
            } else {
                assert.fail('Could not find extension');
            }

            // mock vscode methods
            outputChannel = sandbox.stub(SystemCommand.prototype, 'output');
            showQuickPick = sandbox.stub(vscode.window, 'showQuickPick');
            showInputBox = sandbox.stub(vscode.window, 'showInputBox');
            showWarningMessage = sandbox.stub(vscode.window, 'showWarningMessage');
            sendTerminalText = sandbox.stub(IBMCloudTerminal.instance, 'sendText');
            showTerminal = sandbox.stub(IBMCloudTerminal.instance, 'show');
        });

        afterEach(async function() {
            sandbox.reset();
        });

        after(async function() {
            sandbox.restore();
        });

        context('when not logged in', function () {
            before(async () => {
                try { 
                    const logoutCmd = new SystemCommand('ibmcloud', ['logout']); 
                    const statusCode = await logoutCmd.execute();
                    assert.equal(0, statusCode);
                } catch(e) {
                    assert.fail(e);
                }
            });

            it('should fail to run a dev command', async function () {
                await vscode.commands.executeCommand('extension.ibmcloud.dev.list');
                logStub('ibmcloud dev list', outputChannel);
                assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/FAILED/))).callCount, 1);
                assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/Log in to IBM Cloud/))).callCount, 1);
			});
		});

		context('when already logged in', function() {

			before(async function() {
                try {
                    const loginCmd = new SystemCommand('ibmcloud', ['login', '-r',  'us-south', '-a', 'https://cloud.ibm.com']);
                    let statusCode = await loginCmd.execute();
                    logStub('ibmcloud login', outputChannel);
                    assert.equal(0, statusCode);

                    const targetCFCmd = new SystemCommand('ibmcloud', ['target', '--cf']);
                    statusCode = await targetCFCmd.execute();
                    logStub('ibmcloud target --cf', outputChannel);
                    assert.equal(0, statusCode);
                } catch (e) {
                    assert.fail(e);
                }
            });

            it('should return the api endpoint', async function() {
                await vscode.commands.executeCommand('extension.ibmcloud.api');
                logStub('ibmcloud api', outputChannel);
                assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud api/))).callCount, 1);
                assert.isAbove(outputChannel.withArgs(sinon.match(new RegExp(/API endpoint: https:\/\/(?<subdomain>.*)*cloud.ibm.com/))).callCount, 0);
            });

            context('missing plugin', function() {
                let pluginName:string;
                let installPlugin:sinon.SinonStub;
                let executeWithOutputChannel:sinon.SinonSpy;

                before(async function() {
                    pluginName = 'container-service';
                    installPlugin = sinon.stub(plugin, 'installPlugin');
                    executeWithOutputChannel = sinon.spy(SystemCommand.prototype, 'executeWithOutputChannel');
                    try {
                        if (await plugin.isPluginInstalled(pluginName)) {
                        await plugin.uninstallPlugin(pluginName);
                    }
                } catch (e) {
                    assert.fail(e);
                }
            });

            afterEach(function() {
                installPlugin.reset();
                executeWithOutputChannel.resetHistory();
            });

            after(function() {
                installPlugin.restore();
                executeWithOutputChannel.restore();
            });

            it('should attempt to install container-service plugin and rerun list clusters command', async function() {
                installPlugin.resolves(0);
                showQuickPick.resolves(CONFIRM_YES);
                await vscode.commands.executeCommand('extension.ibmcloud.ks.clusters');
                assert.isAbove(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud ks clusters/))).callCount, 1);
                logStub('ibmcloud ks clusters', outputChannel); 
                assert.isTrue(installPlugin.called);
                //NOTE: called by `ks clusters`, `plugin install`, and reran `ks clusters cmds respectively
                assert.isTrue(executeWithOutputChannel.calledThrice);
            });

            it('should not install container-service and rerun command', async function() {
                installPlugin.resolves(0);
                showQuickPick.resolves(CONFIRM_NO);
                await vscode.commands.executeCommand('extension.ibmcloud.ks.clusters');
                assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud ks clusters/))).callCount, 1);
                logStub('ibmcloud ks clusters', outputChannel); 
                assert.isFalse(installPlugin.called);
                // NOTE: called only once for `ks clusters`
                assert.isTrue(executeWithOutputChannel.calledOnce);
            });
        });

            it('should print list of regions', async function() {
                await vscode.commands.executeCommand('extension.ibmcloud.regions');
                logStub('ibmcloud regions', outputChannel);
                assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud regions/))).callCount, 1);
                assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/Listing regions.../))).callCount, 1);
                assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/(Name)\s+(Display name)/))).callCount, 1);
            });

            it('should display current target', async function() {
                await vscode.commands.executeCommand('extension.ibmcloud.target');
                logStub('ibmcloud target', outputChannel);
                assert.isTrue(outputChannel.calledWith(sinon.match(/ibmcloud target/)));
                assert.isTrue(outputChannel.calledWith(sinon.match(/API endpoint/)));
            });

			context('ibmcloud dev', async function() {

                it('should list applications in output channel', async function () {
                    await vscode.commands.executeCommand('extension.ibmcloud.dev.list');
                    logStub('ibmcloud dev list', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/> ibmcloud dev list --caller-vscode/))).callCount, 1);
				});

                it('should display version info about installed deps in output channel', async function() {
                    // NOTE: command takes longer than usual to run than the others so increase timeout to 2min
                    await vscode.commands.executeCommand('extension.ibmcloud.dev.diag');
                    logStub('ibmcloud dev diag', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/> ibmcloud dev diag --caller-vscode/))).callCount, 1);
                });

                context('when building an application the output channel', function() {

                    it('should print out the correct command to build a release build', async function () {
                        await vscode.commands.executeCommand('extension.ibmcloud.dev.build.release');
                        logStub('ibmcloud dev build', outputChannel);
                        assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/> ibmcloud dev build --caller-vscode/))).callCount, 1);
                    });

                    it('should print out the correct command to build a debug build', async function () {
                        await vscode.commands.executeCommand('extension.ibmcloud.dev.build');
                        logStub('ibmcloud dev build --debug', outputChannel);
                        assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/> ibmcloud dev build --caller-vscode --debug/))).callCount, 1);
                    });
                });

                context('when opening a shell in the application\'s docker containers', function() {
                    const containerTypes = ['run', 'tools'];
                    const buildTypes = {'run': '.release', 'tools': '' };
                    containerTypes.forEach(type => {
                        it(`should open a new sendTerminalText when shelled into the ${type} container`, async function() {
                            await vscode.commands.executeCommand(`extension.ibmcloud.dev.build${buildTypes[type]}`);
                            logStub(`ibmcloud dev build ${buildTypes[type]}`, outputChannel);
                            await vscode.commands.executeCommand(`extension.ibmcloud.dev.shell.${type}`);
                            logStub(`ibmcloud dev shell ${type}`, outputChannel);
                            assert.equal(sendTerminalText.withArgs(sinon.match(`ibmcloud dev shell ${type} --caller-vscode`)).callCount, 1);
                            assert.isTrue(showTerminal.called);
                        });
                    });
                });
            });

            context('ibmcloud account', function() {

                it('should display a list of accounts in a table', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.account.list');
                    logStub('ibmcloud account list', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud account list/))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/(Account GUID)\s+(IMS ID)\s+(Name)\s+(State)\s+(Owner User)\s+(ID)/))).callCount, 1);
                });

                it('should display the current account\'s information', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.account.show');
                    logStub('ibmcloud account show', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud account show/))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/OK/))).callCount, 1);
                });

                it('should display the users in account', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.account.users');
                    logStub('ibmcloud account users', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud account users/))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/Getting users under account (?<account_id>.*)\.\.\./))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/OK/))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/(User ID)\s+(State)/))).callCount, 1);
                });
            });

            context('ibmcloud resource', function() {

                it('should return list of service instances', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.resource.service-instances');
                    logStub('ibmcloud resource service-instances', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud resource service-instances/))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/Retrieving instances with type service_instance in all resource groups in all locations under account (?<account_id>.*)/))).callCount, 1);
                });

            context('ibmcloud plugin', function() {
                let plugins:Array<string>;

                beforeEach(async function () {
                    plugins = ['cloudant'];
                });
                afterEach(async function () {
                    plugins = [];
                });

                it('should be able to install a plugin from official IBM Cloud repo', async function() {
                    showQuickPick.resolves(plugins);
                    await vscode.commands.executeCommand('extension.ibmcloud.plugin.install');
                    logStub('ibmcloud plugin install', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`>\\s+ibmcloud plugin install ${plugins[0]}`))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`Plug-in '${plugins[0]} (?<plugin_version>.*)' was successfully installed`))).callCount, 1);
                });

                it('should update all dev plugins/extensions', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.cli-update');
                    logStub('ibmcloud update', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/ibmcloud plugin update/))).callCount, 1);
                });
                
                it('should be able to install all plugins from official IBM Cloud repo', async function() {
                    // NOTE: This is a long running command so we should increase timeout in this test case
                    this.timeout(120000);
                    showQuickPick.resolves(plugins);
                    await vscode.commands.executeCommand('extension.ibmcloud.cli-install');
                    logStub('ibmcloud plugin install --all -r IBM Cloud -f', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`>\\s+ibmcloud plugin install --all -r IBM Cloud -f`))).callCount, 1);
                });

                context('older version of plugin installed', function() {
                    let oldestPluginVersion: plugin.PluginVersion;

                    before(async function() {
                        plugins = ['cloudant'];
                        let pluginVersions: Array<plugin.PluginVersion>;
                        try {
                            pluginVersions = await plugin.getPluginVersions(plugins[0]);
                        } catch(e) {
                            assert.fail(e);
                        }

                        oldestPluginVersion = pluginVersions[pluginVersions.length-1];

                        const pluginInstallCmd = new SystemCommand('ibmcloud', ['plugin', 'install', plugins[0], 
                            '-v', oldestPluginVersion.version, '-f', '-q']);
                        const statusCode = await pluginInstallCmd.execute();
                        assert.equal(statusCode, 0);

                    });

                    it('should be able to update plugin to latest version', async function() {
                        showQuickPick.resolves(plugins);
                        await vscode.commands.executeCommand('extension.ibmcloud.plugin.update');
                        logStub('ibmcloud plugin update', outputChannel);
                        assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`>\\s+ibmcloud plugin update ${plugins[0]}`))).callCount, 1);
                        assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`Checking upgrades for plug-in '${plugins[0]}`))).callCount, 1);
                        assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`Update '${plugins[0]} ${oldestPluginVersion.version}'`))).callCount, 1);
                        assert.equal(outputChannel.withArgs(sinon.match('The plug-in was successfully upgraded.')).callCount, 1);
                    });
                });

                it('should be able to uninstall plugin', async function() {
                    showQuickPick.resolves(plugins);
                    await vscode.commands.executeCommand('extension.ibmcloud.plugin.uninstall');
                    logStub('ibmcloud plugin uninstall', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`>\\s+ibmcloud plugin uninstall ${plugins[0]}`))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(`Uninstalling plug-in '${plugins[0]}'...`)).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(`Plug-in '${plugins[0]}' was successfully uninstalled.`)).callCount, 1);
                });

            });

                context('ibmcloud service-binding', function() {
                    let getServiceAliases:sinon.SinonStub;
                    let serviceAliases: Array<resource.Resource>;

                    before(() => {
                        getServiceAliases = sinon.stub(resource, 'getServiceAliases');
                        serviceAliases = [{ name: 'cloudant_alias_bdd', guid: 'guid' }];
                    });
                    afterEach(() => {
                        getServiceAliases.reset();
                    });
                    after(() => {
                        getServiceAliases.restore();
                    });

                    it.skip('should return details for a service-binding', async function() {
                        // TODO(me): Figure out why this test stalls and never finishes
                        const cfApp = 'bdd_cf_go_app';
                        getServiceAliases.resolves(serviceAliases); 
                        showQuickPick.resolves(serviceAliases[0].name);
                        showInputBox.resolves(cfApp);

                        await vscode.commands.executeCommand('extension.ibmcloud.resource.service-binding.get');
                        logStub(`ibmcloud resource service-binding ${serviceAliases[0].name} ${cfApp}`, outputChannel);

                        assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`>\\s+ibmcloud resource service-binding ${serviceAliases[0]} ${cfApp}`))).callCount, 1);
                    }); 

                    it('should return list of service-bindings', async function() {
                        getServiceAliases.resolves(serviceAliases);
                        showQuickPick.resolves(serviceAliases[0].name);
                        await vscode.commands.executeCommand('extension.ibmcloud.resource.service-binding.list');
                        logStub(`ibmcloud resource service-bindings ${serviceAliases[0].name}`, outputChannel);
                        assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`>\\s+ibmcloud resource service-bindings ${serviceAliases[0]}`))).callCount, 1);
                        assert.isTrue(sendTerminalText.notCalled);
                    });

                    it('should return a warning message if no service aliases exist in account', async function() {
                        getServiceAliases.resolves([]);
                        await vscode.commands.executeCommand('extension.ibmcloud.resource.service-binding.list');
                        assert.isTrue(showWarningMessage.calledWith('No service alias could be found. Please create a service alias and try again'), 'Expected warning messsage to be printed');
                        assert.isFalse(outputChannel.calledWith(sinon.match(new RegExp(`>\\s+ibmcloud resource service-bindings ${serviceAliases[0]}`))));
                    });
                });
            });

            context('ibmcloud iam', function() {
                let serviceIdName: string;
                before(async function() {
                    try {
                        const serviceIds = await getServiceIds();
                        serviceIdName = serviceIds[0].name;
                    } catch (e) {
                        assert.fail(e);
                    }

                });

                it('should return oauth-tokens', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.iam.oauth-tokens');
                    logStub('ibmcloud iam oauth-tokens', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud iam oauth-tokens/))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/IAM token:\s+Bearer (?<token>.*)/))).callCount, 1);
                });

                it('should return details for a list of service ids', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.iam.service-ids');
                    logStub('ibmcloud iam service-ids', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud iam service-ids/))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/Getting all services IDs bound to current account as (?<user>.*).../))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match('OK')).callCount, 1);
                });

                it('should return details for a service id', async function() {
                    showQuickPick.resolves([serviceIdName]);
                    await vscode.commands.executeCommand('extension.ibmcloud.iam.service-id');
                    logStub('ibmcloud iam service-id', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/>\s+ibmcloud iam service-id (?<service_id_name>.*)/))).callCount, 1);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/Getting service ID (?<service_id_name>.*) as (?<user>.*).../))).callCount, 1);
                });
            });
        });
    });
});
