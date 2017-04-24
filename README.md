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


## Installation 

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

* Only a subset of `bx dev` commands are supported
* `bx cf` commands are not yet supported 
* OpenWhisk commands are not yet supported

Find a bug?  [Let us know here](https://github.ibm.com/arf/ide-vscode-bluemix/issues)