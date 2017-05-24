[![Build Status](https://status.travisci.com/IBM-Bluemix/bluemix-vscode-extension.svg?branch=master)](https://status.travisci.com/IBM-Bluemix/bluemix-vscode-extension)



# Bluemix for VS Code

This extension provides capabilities for IBM Bluemix from directly within the VS Code editor.   Use the command palette to quickly access all `bx dev` commands, without the need to leave the editor context.

Sample Usage: https://youtu.be/aGOXbEOMinE

## Usage

Easily invoke commands from the Bluemix CLI from directly inside of the VS Code editor:

- Open the VS Code command pallette (`F1` or `CMD-Shift-P`)
- Use the `bx dev login` command to log in to Bluemix
- Use the `bx dev build` command to build the app into a Docker image
- Use the `bd dev debug` command to run the app in local Docker for development
- USe the `bx dev deploy` command to deploy the app (in the Docker container) to Bluemix

## Requirements/Dependencies

* [Bluemix CLI](https://plugins.ng.bluemix.net/ui/home.html)
* Bluemix `dev` cli plugin   
    After installing the Bluemix CLI, open up a terminal and run `bx plugin install dev -r Bluemix`
* [Docker](https://www.docker.com/) - required by `bx dev` containers




## Debugging Node.js apps within the local container

First, make sure your app is running inside of a local container using `bx dev debug`.  

Next, You have to create a launch configuration inside of `.vscode/launch.json`.   If you don't already have a `launch.json` file, go to the `Debug` -> `Add Configuration` menu and paste the following into the `configurations` array.  The default debug port is `5858` and the default remoteRoot is `/app/`:

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


## ⚠️ Submit an Issue

For more information come find us on Slack

Find a bug?  [Let us know here](https://github.com/IBM-Bluemix/bluemix-vscode-extension/issues)



## ![slack logo](https://developer.ibm.com/cloud-native/public/img/slack-icon.svg) Connect on Slack
[Sign up](https://ibm.biz/IBMCloudNativeSlack) for our slack team and join the [#bluemix-dev-services](https://ibm-cloud-tech.slack.com/messages/bluemix-dev-services) channel to ask questions and chat with fellow users.


## ![slack logo](https://developer.ibm.com/cloud-native/public/img/so-icon.svg) Check Stack Overflow
Search for the [bluemix-dev-services](http://stackoverflow.com/questions/tagged/bluemix-dev-services) tag on Stack Overflow for answers to common questions.
