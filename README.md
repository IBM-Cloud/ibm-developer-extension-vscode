[![Build Status](https://travis-ci.org/IBM-Bluemix/ibm-developer-extension-vscode.svg?branch=master)](https://travis-ci.org/IBM-Bluemix/ibm-developer-extension-vscode)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg?style=flat)](https://raw.githubusercontent.com/IBM-Bluemix/ibm-developer-extension-vscode/master/LICENSE.txt)
[![Version](https://vsmarketplacebadge.apphb.com/version/IBM.ibm-developer.svg)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/IBM.ibm-developer.svg)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/IBM.ibm-developer.svg)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)


# IBM Developer Extension for VS Code

This extension provides capabilities for the IBM [developer cli](https://console.ng.bluemix.net/docs/cloudnative/dev_cli.html) from directly within the VS Code editor.   Use the VS Code command palette to quickly access all `bx dev` commands, without the need to leave the editor's context.

## Changelog
- *v0.0.10* 
  - Updated badges in README for VS Code marketplace compliance.  
  - Fixed "killed terminal" bug in login/logout commands
- *v0.0.9* - Updated usage/getting started in README
- *v0.0.8* - first public release

## Usage

Easily invoke commands from the IBM Bluemix Developer CLI from directly inside of the VS Code editor:

- Open the VS Code command pallette (`F1` or `CMD-Shift-P`)
- Use the `bx login` command to log in to Bluemix (using your Bluemix credentials)

### Using `bx dev` workflow: 
Video demonstrating `bx dev` workflow: [IBM Developer Extension for VS Code
](https://youtu.be/JmrLaLRRQSk)

Steps to get started:
- Create a project using one of the two methods below:
    - `bx dev create` using the Bluemix Developer CLI (outside of VS Code)
    - [Bluemix Web console](https://console.ng.bluemix.net/developer/getting-started/)
- Open the *project’s folder* locally in the VS Code editor
- Use the `bx dev build` command to build the app into a Docker image
- Use the `bx dev debug` command to run the app in local Docker for development
- Use the `bx dev run` command to run the app in local Docker in release mode
- USe the `bx dev deploy` command to deploy the app (in the Docker container) to Bluemix

### Using CloudFoundry workflow: 
Video demonstrating `CloudFoundry` workflow: [IBM Developer Extension for VS Code for CloudFoundry
](https://youtu.be/gP_6cpR1JSM)

Steps to get started:
- Create a new CloudFoundry application
    - Use the [web console](https://console.ng.bluemix.net/dashboard/cf-apps) and download the starter code
    - Create a new CloudFoundry app manually
- Open the *project’s folder* locally in the VS Code editor
- Use `bx cf apps` to list all of your apps
- Use `bx cf push` to push a build of your app
- Use `bx cf <start/stop/restage/restart>` to change the status of your app
- Use `bx cf logs` to view the live log stream for your app
  - _Use `bx cf logs` to stop the log stream_

### Supported CLI/plugins:

- `bx login/logout` - Bluemix user authentication
- `bx dev` - Bluemix developer CLI
- `bx cf` - Bluemix CloudFoundry CLI
- `bx cs` - Bluemix Container Service CLI
- `bx sdk` - Bluemix SDK Generation CLI

## Requirements/Dependencies

* [Bluemix CLI](https://plugins.ng.bluemix.net/ui/home.html)
* Bluemix `dev` cli plugin   
    After installing the Bluemix CLI, open up a terminal and run `bx plugin install dev -r Bluemix`
* [Docker](https://www.docker.com/) - required by `bx dev` containers



## Debugging Node.js apps within the local Docker container

First, make sure your app is running inside of a local container using `bx dev debug`. _Note: `debug` action requires prior `bx dev build --debug` action)_

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

## Contributing

All improvements to the Bluemix Dev Extension for VS Code are very welcome! Here's how to get started ...

Fork this repository.
$ git clone https://github.com/IBM-Bluemix/ibm-developer-extension-vscode.git

Start making your changes, then send us a pull request.

You can find more info on contributing in our [contributing guidelines](./CONTRIBUTING.md).

You can find more info about the development environment and configuration in our [development guidelines](./DEVELOPMENT.md)

## ⚠️  Bugs / Issues / Defects

Find a bug?  [Let us know here](https://github.com/IBM-Bluemix/ibm-developer-extension-vscode/issues)

For additional support, find us on Slack or Stack Overflow using the links below.

### <img src="https://developer.ibm.com/cloud-native/public/img/slack-icon.svg" alt="Slack" style="height: 18px;"/> Connect on Slack
[Sign up](https://ibm.biz/IBMCloudNativeSlack) for our slack team and join the [#bluemix-dev-services](https://ibm-cloud-tech.slack.com/messages/bluemix-dev-services) channel to ask questions and chat with fellow users.


### <img src="https://developer.ibm.com/cloud-native/public/img/so-icon.svg" alt="Stack Overflow" style="height: 18px;"/> Check Stack Overflow
Search for the [bluemix-dev-services](http://stackoverflow.com/questions/tagged/bluemix-dev-services) tag on Stack Overflow for answers to common questions.
