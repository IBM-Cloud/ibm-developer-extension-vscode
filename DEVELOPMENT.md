## Dev Environment Configuration

* Use [VS Code](https://code.visualstudio.com/) to develop VS Code extensions.
* Make sure you have a IBM Cloud CLI generated application.
* Once you've copied the project source code locally, be sure to run `npm install` from a terminal to download Node.js dependencies and configure your dev environment (auto configures pre-commit hooks).
* Add launch commands in `.vscode/launch.json` for extension launch and testing:
    (You can also do this from the debug sidebar's gear icon, or select "Add Configuration" from the debug target drop down menu.)

    ```
    // A launch configuration that compiles the extension and then opens it inside a new window
    {
        "version": "0.1.0",
        "configurations": [
            {
                "name": "Launch Extension",
                "type": "extensionHost",
                "request": "launch",
                "runtimeExecutable": "${execPath}",
                "args": ["--extensionDevelopmentPath=${workspaceRoot}" ],
                "stopOnEntry": false,
                "sourceMaps": true,
                "outFiles": [ "${workspaceRoot}/out/src/**/*.js" ],
                "preLaunchTask": "npm: compile"
            },
            {
                "name": "Launch Tests",
                "type": "extensionHost",
                "request": "launch",
                "runtimeExecutable": "${execPath}",
                "args": ["/path/to/generated-starterkit/", --extensionDevelopmentPath=${workspaceRoot}", "--extensionTestsPath=${workspaceRoot}/out/test" ],
                "stopOnEntry": false,
                "sourceMaps": true,
                "outFiles": [ "${workspaceRoot}/out/test/**/*.js" ],
                "preLaunchTask": "npm: compile"
            }
        ]
    }
    ```
* Install `vsce` (to be able to package `.vsix` builds)
    ```
    npm install -g vsce
    ```
* Install these VS Code extensions:
    * [TSLint Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)



## Packaging a build

To distribute a build, you have to use the [`vsce` tool from Microsoft](https://code.visualstudio.com/docs/extensions/publish-extension).   You can package a build locally to produce a `.vsix` file using `vsce package`.

You can *only* submit to the VS Code marketplace using the `vsce publish` command.


## Installing a local/test build (`.vsix` file):

1. Package or Download a release from https://github.com/IBM-Bluemix/ibm-developer-extension-vscode/releases
1. From within the VS Code editor, open the extensions browser.
1. Click on the "`...`" menu.
1. Select the `Install from VSIX` option, and select the .vsix file that you downloaded.
1. You're all set!
