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

        let resultHandler = function(code) {
            assert.equal('0', code.toString());
            done();
        };

        let command = new SystemCommand('ls', ['-l', '-a']);
        command.execute()
        .then(resultHandler, resultHandler);
    });


    // this will fail on windows b/c its a linux/osx command
    // testing a non-existant command execution
    test('Error System Command', (done) => {

        let resultHandler = function(code) {
            assert.notEqual('0', code.toString());
            done();
        };

        let command = new SystemCommand('foo');
        command.execute()
        .then(resultHandler, resultHandler);
    });
});