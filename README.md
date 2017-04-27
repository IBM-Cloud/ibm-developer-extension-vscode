# Bluemix for VS Code

This extension provides the capabilities for IBM Bluemix from directly within the VS Code editor.   Use the command pallete to quickly access all `bx dev` commands, without the need to leave the editor context.

Sample Usage: https://youtu.be/aGOXbEOMinE

## Features

Easily invoke commands from the Bluemix CLI from directly inside of the VS Code editor:

_editor extension assumes CLI is already logged in_

### bx dev commands
* `bx dev list`
* `bx dev build`
* `bx dev debug`
* `bx dev deploy`
* `bx dev run`
* `bx dev status`
* `bx dev stop`
* `bx dev test`

### bx cf commands

* `bx cf apps`
* `bx cf app`
* `bx cf create-app-manifest`
* `bx cf push`
* `bx cf start`
* `bx cf stop`
* `bx cf restart`
* `bx cf restage`
* `bx cf events`
* `bx cf logs`
* `bx cf env`

### bx cs commands

* `bx cs init`
* `bx cs clusters`
* `bx cs cluster-create`
* `bx cs cluster-get`
* `bx cs cluster-rm`
* `bx cs workers`
* `bx cs worker-add`
* `bx cs worker-get`
* `bx cs worker-reboot`
* `bx cs worker-reload`
* `bx cs worker-rm`

## Requirements/Dependencies

* [Bluemix CLI](https://plugins.ng.bluemix.net/ui/home.html)
* Bluemix `dev` cli plugin   
    After installing the Bluemix CLI, open up a terminal and run `bx plugin install dev -r Bluemix`
* [Docker](https://www.docker.com/) - required by `bx dev` containers


## Dev Environment Configuration

* Use [VS Code](https://code.visualstudio.com/) to develop VS Code extensions.
* Once you've copied the project source code locally, be sure to run `npm install` from a terminal to download Node.js dependencies and configure you dev environment (auto configures pre-commit hooks).
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
                "preLaunchTask": "npm"
            },
            {
                "name": "Launch Tests",
                "type": "extensionHost",
                "request": "launch",
                "runtimeExecutable": "${execPath}",
                "args": ["--extensionDevelopmentPath=${workspaceRoot}", "--extensionTestsPath=${workspaceRoot}/out/test" ],
                "stopOnEntry": false,
                "sourceMaps": true,
                "outFiles": [ "${workspaceRoot}/out/test/**/*.js" ],
                "preLaunchTask": "npm"
            }
        ]
    }
    ```

* Install these VS Code extensions:
    * [TSLint Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)



## Packaging a build

To distribute a build, you have to use the [`vsce` tool from Microsoft](https://code.visualstudio.com/docs/extensions/publish-extension).   You can package a build locally to produce a `.vsix` file using `vsce package`.

You can *only* submit to the VS Code marketplace using the `vsce publish` command.  

## Installation 

Once published, you will be able to install the extension simply by searching for it and going through the default install process via the VS Code marketplace.

### Installing a local build (`.vsix` file):

1. Download a release from https://github.ibm.com/arf/ide-vscode-bluemix/releases
1. From within the VS Code editor, open the extensions browser.
1. Click on the "`...`" menu. 
1. Select the `Install from VSIX` option, and select the .vsix file that you downloaded.
1. You're all set! 


## Debugging Node.js apps within the container

You have to create a launch configuration inside of `.vscode/launch.json`.   If you don't already have a `launch.json` file, go to the `Debug` -> `Add Configuration` menu and paste the following into the `configurations` array:

```
{
    "type": "node",
    "request": "attach",
    "name": "Attach to Local Container",
    "address": "localhost",
    "port": 5858,
    "localRoot": "${workspaceRoot}/",
    "remoteRoot": "/app/"
}
```

## Known Issues

* Only a subset of `bx dev`, `bx cf`, and `bx cs` commands are supported
* OpenWhisk commands are not yet supported

## Bugs

Find a bug?  [Let us know here](https://github.ibm.com/arf/ide-vscode-bluemix/issues)

