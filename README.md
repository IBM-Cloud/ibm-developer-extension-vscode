[![Build Status](https://travis-ci.org/IBM-Bluemix/bluemix-vscode-extension.svg?branch=master)](https://travis-ci.org/IBM-Bluemix/bluemix-vscode-extension)



# Bluemix Dev Extension for VS Code

This extension provides capabilities for the IBM Bluemix [developer cli](https://console.ng.bluemix.net/docs/cloudnative/dev_cli.html) from directly within the VS Code editor.   Use the VS Code command palette to quickly access all `bx dev` commands, without the need to leave the editor's context.

Sample Usage: https://youtu.be/aGOXbEOMinE

## Changelog

- *v0.0.5* - first public release

## Usage

Easily invoke commands from the Bluemix CLI from directly inside of the VS Code editor:

- Open the VS Code command pallette (`F1` or `CMD-Shift-P`)
- Use the `bx dev login` command to log in to Bluemix

### Using `bx dev` workflow: 
- Use the `bx dev build` command to build the app into a Docker image
- Use the `bd dev debug` command to run the app in local Docker for development
- USe the `bx dev deploy` command to deploy the app (in the Docker container) to Bluemix

### Using CloudFoundry workflow: 
- Use `bx cf apps` to list all of your apps
- Use `bx cf push` to push a build of your app
- Use `bx cf <start/stop/restage/restart>` to change the status of your app
- Use `bx cf logs` to view the live log stream for your app

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
$ git clone https://github.com/IBM-Bluemix/bluemix-vscode-extension

Start making your changes, then send us a pull request.

You can find more info on contributing in our [contributing guidelines](./CONTRIBUTING.md).

You can find more info about the development environment and configuration in our [development guidelines](./DEVELOPMENT.md)

## ⚠️  Bugs / Issues / Defects

Find a bug?  [Let us know here](https://github.com/IBM-Bluemix/bluemix-vscode-extension/issues)

For additional support, find us on Slack or Stack Overflow using the links below.

### <img src="https://developer.ibm.com/cloud-native/public/img/slack-icon.svg" alt="Slack" style="height: 18px;"/> Connect on Slack
[Sign up](https://ibm.biz/IBMCloudNativeSlack) for our slack team and join the [#bluemix-dev-services](https://ibm-cloud-tech.slack.com/messages/bluemix-dev-services) channel to ask questions and chat with fellow users.


### <img src="https://developer.ibm.com/cloud-native/public/img/so-icon.svg" alt="Stack Overflow" style="height: 18px;"/> Check Stack Overflow
Search for the [bluemix-dev-services](http://stackoverflow.com/questions/tagged/bluemix-dev-services) tag on Stack Overflow for answers to common questions.
