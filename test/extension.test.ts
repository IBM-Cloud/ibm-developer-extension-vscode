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

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import {SystemCommand} from '../src/util/SystemCommand';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', () => {


    // this will fail on windows b/c its a linux/osx command
    // testing generic system command execution
    test('"ls -la" System Command', (done) => {

        const resultHandler = function(code) {
            assert.equal('0', code.toString());
            done();
        };

        const command = new SystemCommand('ls', ['-l', '-a']);
        command.execute()
        .then(resultHandler, resultHandler);
    });


    // this will fail on windows b/c its a linux/osx command
    // testing a non-existant command execution
    test('Error System Command', (done) => {

        const resultHandler = function(code) {
            assert.notEqual('0', code.toString());
            done();
        };

        const command = new SystemCommand('foo');
        command.execute()
        .then(resultHandler, resultHandler);
    });
});