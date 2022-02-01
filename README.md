[![Build Status](https://travis-ci.org/IBM-Cloud/ibm-developer-extension-vscode.svg?branch=master)](https://travis-ci.org/IBM-Cloud/ibm-developer-extension-vscode)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg?style=flat)](https://raw.githubusercontent.com/IBM-Cloud/ibm-developer-extension-vscode/master/LICENSE.txt)
[![Version](https://vsmarketplacebadge.apphb.com/version/IBM.ibm-developer.svg)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/IBM.ibm-developer.svg)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/IBM.ibm-developer.svg)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)


# IBM Developer Extension for VS Code

This extension provides capabilities for the IBM [developer cli](https://console.ng.bluemix.net/docs/cloudnative/dev_cli.html) from directly within the VS Code editor.   Use the VS Code command palette to quickly access all `ibmcloud dev` commands, without the need to leave the editor's context.

## Changelog
- *v0.0.15*
- Updated to IBM Cloud 2.3.0
- *v0.0.14*
  - Added `bx dev console` command
  - Added check for hostname and domain in cli-config.yml for CF deployment (no longer required when project is created)
- *v0.0.13*
  - Updated IBM Cloud icon
- *v0.0.12*
  - Added support for `bx dev shell` command
  - Removed support for the `sdkgen` cli
  - Improved cli version detection with minimum versioning and forced upgrade paths to support new cli features
  - Added support for "caller" arguments for the `dev` cli
- *v0.0.11*
  - Added support for Kubernetes/Helm deployment
  - Added support for `bx dev console`
- *v0.0.10*
  - Updated badges in README for VS Code marketplace compliance.
  - Fixed "killed terminal" bug in login/logout commands
- *v0.0.9* - Updated usage/getting started in README
- *v0.0.8* - first public release

## Usage

Easily invoke commands from the IBM Cloud Developer CLI from directly inside of the VS Code editor:

- Open the VS Code command palette (`F1` or `CMD-Shift-P`)
- Use the `ibmcloud login` command to log in to IBM Cloud (using your IBM Cloud credentials)

### Using `ibmcloud dev` workflow:
Video demonstrating `ibmcloud dev` workflow: [IBM Developer Extension for VS Code
](https://youtu.be/JmrLaLRRQSk)

Steps to get started:
- Create a project using one of the two methods below:
    - `ibmcloud dev create` using the IBM Cloud Developer CLI (outside of VS Code)
    - [IBM Cloud Developer Documentation](https://cloud.ibm.com/docs?tab=develop)
- Open the *project’s folder* locally in the VS Code editor
- Use the `ibmcloud dev build` command to build the app into a Docker image
- Use the `ibmcloud dev debug` command to run the app in local Docker for development
- Use the `ibmcloud dev run` command to run the app in local Docker in release mode
- Use the `ibmcloud dev deploy` command to deploy the app (in the Docker container) to IBM Cloud
- Use the `ibmcloud dev view` command to open your deployed project on IBM Cloud in a web browser
- Use the `ibmcloud dev console` command to open the IBM Cloud console for your project in a web browser

### Using CloudFoundry workflow:
Video demonstrating `CloudFoundry` workflow: [IBM Developer Extension for VS Code for CloudFoundry
](https://youtu.be/gP_6cpR1JSM)

Steps to get started:
- Create a new CloudFoundry application
    - Use the [web console](https://console.ng.bluemix.net/dashboard/cf-apps) and download the starter code
    - Create a new CloudFoundry app manually
- Open the *project’s folder* locally in the VS Code editor
- Use `ibmcloud cf apps` to list all of your apps
- Use `ibmcloud cf push` to push a build of your app
- Use `ibmcloud cf <start/stop/restage/restart>` to change the status of your app
- Use `ibmcloud cf logs` to view the live log stream for your app
  - _Use `ibmcloud cf logs` to stop the log stream_

### Supported CLI/plugins:

- `ibmcloud login/logout` - IBM Cloud user authentication
- `ibmcloud dev` - IBM Cloud developer CLI
- `ibmcloud cf` - IBM Cloud CloudFoundry CLI
- `ibmcloud ks` - IBM Cloud Container Service CLI

## Requirements/Dependencies

* [IBM Cloud CLI](https://cloud.ibm.com/docs/cli/index.html)
* [Docker](https://www.docker.com/) - required by `ibmcloud dev` containers



## Debugging Node.js apps within the local Docker container

First, make sure your app is running inside of a local container using `ibmcloud dev debug`. _Note: `debug` action requires prior `ibmcloud dev build --debug` action)_

Next, You have to create a launch configuration inside of `.vscode/launch.json`.   If you don't already have a `launch.json` file, go to the `Debug` -> `Add Configuration` menu and paste the following into the `configurations` array.  The default debug port is `9229` and the default remoteRoot is `/app/`:

```
{
    "type": "node",
    "request": "attach",
    "name": "Attach to Local Container",
    "address": "localhost",
    "port": 9229,
    "localRoot": "${workspaceRoot}/",
    "remoteRoot": "/app/"
}
```

## Contributing

All improvements to the IBM Cloud Dev Extension for VS Code are very welcome! Here's how to get started ...

Fork this repository.
$ git clone https://github.com/IBM-Cloud/ibm-developer-extension-vscode.git

Start making your changes, then send us a pull request.

You can find more info on contributing in our [contributing guidelines](./CONTRIBUTING.md).

You can find more info about the development environment and configuration in our [development guidelines](./DEVELOPMENT.md)

## ⚠️  Bugs / Issues / Defects

Find a bug?  [Let us know here](https://github.com/IBM-Cloud/ibm-developer-extension-vscode/issues)

For additional support, find us on Slack or Stack Overflow using the links below.

### ![Slack](assets/slack.png) Connect on Slack
[Sign up](https://ibm.biz/IBMCloudNativeSlack) for our slack team and join the [#bluemix-dev-services](https://ibm-cloud-tech.slack.com/messages/bluemix-dev-services) channel to ask questions and chat with fellow users.

### ![Stack Overflow](assets/stack_overflow.png) Check Stack Overflow
Search for the [bluemix-dev-services](http://stackoverflow.com/questions/tagged/bluemix-dev-services) tag on Stack Overflow for answers to common questions.
