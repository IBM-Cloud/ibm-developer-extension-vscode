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
import * as packageJson from '../package.json';
import { getPluginVersions, PluginVersion } from '../src/ibmcloud/plugin';
import { getServiceIds } from '../src/ibmcloud/iam';

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
                    const statusCode = await loginCmd.execute();
                    logStub('ibmcloud login', outputChannel);
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
                it('should update all dev plugins/extensions', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.cli-update');
                    logStub('ibmcloud update', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/ibmcloud plugin update/))).callCount, 1);
                });

                it('should list applications in output channel', async function () {
                    await vscode.commands.executeCommand('extension.ibmcloud.dev.list');
                    logStub('ibmcloud dev list', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/> ibmcloud dev list --caller-vscode/))).callCount, 1);
				});

                it('should display version info about installed deps in output channel', async function() {
                    // NOTE: command takes longer than usual to run than the others so increase timeout to 2min
                    this.timeout(120000);
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
                    let sendTerminalText:sinon.SinonSpy;
                    let showTerminal:sinon.SinonSpy;

                    before(async function () {
                        sendTerminalText = sandbox.stub(IBMCloudTerminal.instance, 'sendText');
                        showTerminal = sandbox.stub(IBMCloudTerminal.instance, 'show');
                    });

                    afterEach(async function() {
                        sandbox.reset();
                    });

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
                
                it('should be able to install all plugins from official IBM Cloud repo', async function() {
                    // NOTE: This is a long running command so we should increase timeout in this test case
                    this.timeout(75000);
                    showQuickPick.resolves(plugins);
                    await vscode.commands.executeCommand('extension.ibmcloud.cli-install');
                    logStub('ibmcloud plugin install --all -r IBM Cloud -f', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(`>\\s+ibmcloud plugin install --all -r IBM Cloud -f`))).callCount, 1);
                });

                context('older version of plugin installed', function() {
                    let oldestPluginVersion: PluginVersion;

                    before(async function() {
                        plugins = ['cloudant'];
                        let pluginVersions: Array<PluginVersion>;
                        try {
                            pluginVersions = await getPluginVersions(plugins[0]);
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
