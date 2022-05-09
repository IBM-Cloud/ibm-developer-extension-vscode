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
import { IBMCloudTerminal } from '../src/util/IBMCloudTerminal';
import {SystemCommand} from '../src/util/SystemCommand';
import * as packageJson from '../package.json';

// Defines a Mocha test suite to group tests of similar kind together
function logStub(cmd:string, outputChannel:sinon.SinonStub) {
    console.log(`\n================================(${cmd})================================`);
    outputChannel.args.forEach((arg:any) => {
        // TODO(me): Remove later 
        console.log(arg);
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
        const sandbox = sinon.createSandbox();

        before(async function () {		
            extension = vscode.extensions.getExtension(extensionName);
            if (extension) {
                await extension.activate();
            } else {
                assert.fail('Could not find extension');
            }
            outputChannel = sandbox.stub(SystemCommand.prototype, 'output');
        });

        afterEach(async function() {
            sandbox.reset();
        });

        after(async function() {
            sandbox.restore();
        });

        it('should return the api endpoint', async function() {
            await vscode.commands.executeCommand('extension.ibmcloud.api');
            logStub('ibmcloud api', outputChannel);
            assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/API endpoint: https:\/\/(?<subdomain>.*)*cloud.ibm.com/))).callCount, 1);
        });

        context('when not logged in', function () {
            before(async () => {
                const logoutCmd = new SystemCommand('ibmcloud', ['logout']); 
                const statusCode = await logoutCmd.execute();
                assert.equal(0, statusCode);
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
                const loginCmd = new SystemCommand('ibmcloud', ['login', '-r',  'us-south', '-a', 'https://cloud.ibm.com']);
                const statusCode = await loginCmd.execute();
                logStub('ibmcloud login', outputChannel);
                assert.equal(0, statusCode);
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
                this.timeout(30000);

                it('should update all dev plugins/extensions', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.cli-update');
                    logStub('ibmcloud update', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/ibmcloud plugin update/))).callCount, 1);
                });

                it('should display version info about installed deps in output channel', async function() {
                    await vscode.commands.executeCommand('extension.ibmcloud.dev.diag');
                    logStub('ibmcloud dev diag', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/> ibmcloud dev diag --caller-vscode/))).callCount, 1);
                });

                it('should list applications in output channel', async function () {
                    await vscode.commands.executeCommand('extension.ibmcloud.dev.list');
                    logStub('ibmcloud dev list', outputChannel);
                    assert.equal(outputChannel.withArgs(sinon.match(new RegExp(/> ibmcloud dev list --caller-vscode/))).callCount, 1);
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
        });
    });
});
