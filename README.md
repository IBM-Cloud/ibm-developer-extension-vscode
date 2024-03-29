[![Build Status](https://travis-ci.org/IBM-Cloud/ibm-developer-extension-vscode.svg?branch=master)](https://travis-ci.org/IBM-Cloud/ibm-developer-extension-vscode)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg?style=flat)](https://raw.githubusercontent.com/IBM-Cloud/ibm-developer-extension-vscode/master/LICENSE.txt)
[![Version](https://img.shields.io/visual-studio-marketplace/v/IBM.ibm-developer)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/IBM.ibm-developer)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)
[![Ratings](https://img.shields.io/visual-studio-marketplace/r/IBM.ibm-developer)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer)

# IBM Cloud CLI Extension for VS Code

This extension provides capabilities for the [IBM Cloud CLI](https://cloud.ibm.com/docs/cli/index.html) from directly within the VS Code editor. Use the VS Code command palette to quickly access `ibmcloud` commands, without the need to leave the editor's context.

## Changelog
- v1.0.1
  - Remove references to dev commands in README
- v1.0.0
  - BREAKING CHANGE: Removed dev commands (list, build, deploy, debug, diag, shell, status, run, stop, console, view, test)
- v0.3.0
  - Removed deprecated cf commands
- v0.2.0
  - Added plugin commands (install, uninstall, update)
  - Added iam commands (oauth-tokens, service-id, service-ids)
  - Added additional resource commands (service-binding, service-bindings, service-alias, service-aliases)
  - Fixed autodetect missing cli/plugin binaries
  - Added user option to install missing plugin and rerun previous failed command
- v0.1.0
  - Added basic account commands (list, show, users)
  - Added view api endpoint command
  - Added list regions command
  - Added view target command
  - Added view service instances command
  - Improved UX for deploy command
    - BREAKING CHANGE: `deploy` command only supports IBM Cloud Kubernetes Service
  - Removed old YouTube tutorials from README
  - Improved development flow instructions in README
  - Removed CloudFoundry workflow from README
- v0.0.16
  - Improved performance when displaying CLI logs in Output Channel
  - Used correct command ext identifier when calling cf logs commands
- *v0.0.15*
  - Updated to IBM Cloud 2.6.0
  - Rebranded extension to IBM Cloud CLI
  - Fixed user input box not showing after first usage
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

Easily invoke commands from the IBM Cloud CLI from directly inside of the VS Code editor:

- Open the VS Code command palette (`F1` or `CMD-Shift-P`)
- Use the `ibmcloud login` command to log in to IBM Cloud (using your IBM Cloud credentials)

### Steps to get started:

- Create a project or open an existing project. Examples on how to create a project are listed below:
    - [Create and deploy a Node.js Express app by using IBM Cloud Schematics](https://cloud.ibm.com/docs/apps?topic=apps-tutorial-node-webapp)
    - [Create and deploy a Java Spring app by using IBM Cloud Schematics](https://cloud.ibm.com/docs/apps?topic=apps-tutorial-spring-webapp)
    - [Create and deploy a Java Liberty app by using IBM Cloud Schematics](https://cloud.ibm.com/docs/apps?topic=apps-tutorial-liberty-webapp)
    - [Create and deploy an app using Code Engine](https://cloud.ibm.com/docs/apps?topic=apps-tutorial-cd-code-engine)
    - [Create and deploy a secure app with Devops](https://cloud.ibm.com/docs/apps?topic=apps-tutorial-cd-devsecops)
    - [Develop a Kubernetes app with Helm](https://www.ibm.com/cloud/architecture/tutorials/use-develop-kubernetes-app-with-helm-toolchain)
- Open the *project’s folder* in VS Code
    - Press Ctrl-K+Ctrl-O or navigate to File -> Open Folder to select folder

### Supported CLI/plugins:

- `ibmcloud login/logout` - IBM Cloud User Authentication
- `ibmcloud ks` - IBM Cloud Kubernetes Service CLI
- `ibmcloud api` - View IBM Cloud API endpoint
- `ibmcloud regions` - View IBM Cloud regions
- `ibmcloud account` - View IBM Cloud accounts and users
- `ibmcloud resource` - View IBM Cloud Service Instances, Service Bindings, and Service Aliases
- `ibmcloud target` - View targeted IBM Cloud org, space, account, and resource group
- `ibmcloud plugin` - Install, uninstall, and update IBM Cloud CLI plugins
- `ibmcloud iam` - Display Oauth tokens and IBM Cloud Service IDs

## Requirements/Dependencies

* [IBM Cloud CLI](https://cloud.ibm.com/docs/cli/index.html)
* [Docker](https://www.docker.com/) - required by `ibmcloud dev` containers

## Contributing

All improvements to the IBM Cloud CLI Extension for VS Code are very welcome! Here's how to get started ...

Fork this repository.
$ git clone https://github.com/IBM-Cloud/ibm-developer-extension-vscode.git

Start making your changes, then send us a pull request.

You can find more info on contributing in our [contributing guidelines](./CONTRIBUTING.md).

You can find more info about the development environment and configuration in our [development guidelines](./DEVELOPMENT.md)

## ⚠️  Bugs / Issues / Defects

Find a bug?  [Let us know here](https://github.com/IBM-Cloud/ibm-developer-extension-vscode/issues)

### ![Slack](assets/slack.png) Connect on Slack
Please provide your experience, questions and feedback in the #ask-your-question Slack channel. Apply for access or login here: http://ibm.biz/cli-feedback
