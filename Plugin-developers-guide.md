# Doulevo plugin developers guide

NOTE: Doulevo is a work in progress, this document is incomplete and the plugin creation process will probably change.

Doulevo can be extended through plugins. 

Each plugin allows a new project type to be created with Doulevo. The plugin includes a template starter project (basically a "hello world" program) and it includes templates for Dockerfiles and Kubernetes configuration files to build, run and deploy the project.

To understand the structure of a plugin please see the Node.js plugin here:
https://github.com/doulevo/plugin-nodejs

# Plugin repo structure

This explains the file system of a Doulveo plugin using the Node.js plugin as an example:

```
plugin-nodejs                               - Root directory for the plugin's code repository.
│   plugin.json                             - Configuration file for the plugin.
│   README.MD                               - README for the plugin.
│
├───create-template                         - The template for project, projects are created
│   │                                         from this when you invoke `doulevo create`.
│   │   README.MD                           - README for the template.
│   │   template.json                       - Configuration file for the template.
│   │
│   └───assets                              - Assets for the template. 
│       │   .gitignore                        For the Node.js plugin this directory contains 
│       │   .npmignore                        the files for a "hello world" Node.js project.
│       │   LICENSE
│       │   package-lock.json
│       │   package.json
│       │   README.MD                       - README for the Node.js project.
│       │
│       └───src
│           │   index.js                    - Main code file for the Node.js project.
│           │                                 This simply prints "hello world".
│           └───test
│                   index.test.js           - An example test for the project.
│
└───template-files                          - Additional template files required to 
    │                                         build, run and deploy this project.
    ├───docker                              - Templates for Dockerfiles to build and run the project.
    |       Dockerfile-dev                  - The development Docker file.
    |       Dockerfile-prod                 - The production Docker file.
    └───kubernetes                          - Templates for Kubernetes file.
            deployment.yaml                 - The Kubernetes configuration file to 
                                              deploy the project to Kubernetes.
```

# Plugin configuration file

The root directory for the plugin contains the configuration file `plugin.json`.

Currently this file only specifies which directories are shared between the host OS and the container for the service when running in development. This allows code to be updated on the development computer and automatically have those files be syncrhonized into the container and the service reloaded.

To make use of this you need to author your `Dockerfile-dev` to detect when code files have changed and automatically rebuild and restart the code running in the service.

The `plugin.json` for the Node.js plugin looks like this:

```json
{
    "sharedDirectories": [ // Array of directories to share between host OS and the container.
        {
            "host": "src",  // The directory on the host to share, relative to the Doulevo project.
            "container": "/usr/src/app/src" // The direwctory to share to within in the container.
        }
    ]
}
```

# The create template

When the user invokes the command `doulevo create` Doulevo asks the user some questions, selects a project type (e.g. Node.js) and then expands the template from the `create-template` directory of the plugin to create a Doulevo project on the user's computer.

The configuration file for the create template is called `template.json` and it contains details on what questions to ask the user and how to expand the files in the template.

As an example consider [the `template.json` from the Node.js plugin](https://github.com/doulevo/plugin-nodejs/blob/main/create-template/template.json):

```json
{
    "expand": [             // The files in the create template that 
        "package.json",     // should be expanded with template data.
        "README.MD"
    ],
    "questions": [                          // Questions to ask the user. 
        {                                   // Answers to these questions can be used to fill in the
            "type": "input",                // blanks when the create template is expanded.
            "name": "packageVersion",
            "default": "0.0.1",
            "message": "Enter the initial version number for your new project."
        },
        {
            "type": "list",
            "name": "nodeJsVersion",
            "default": "14",
            "choices": ["10", "12", "14" ],
            "message": "Enter the version of Node.js to use."
        }
    ]
}
```

Template files are stored under the `assets` directory ([see what this looks like for the Node.js project](https://github.com/doulevo/plugin-nodejs/tree/main/create-template/assets)).

Template files that are specified in the `expand` field of `template.json` are expanded with template data. For example this is the `package.json` file from the create template in the Node.js plugin:

```json
{
  "name": "{{name}}",                  // Filled out with the name of the project.
  "version": "{{packageVersion}}",     // The starting version of the package.
  "description": "{{description}}",    // The description of the project.
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "start:dev": "nodemon src/index.js --legacy-watch",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "jest": "^26.6.3",
    "nodemon": "^2.0.7"
  }
}
```

From the example above note the template expansions in double curly brackets, like `{{name}}` and `{{packageVersion}}`. These are expanded based on questions the user is asked during project creation, some of these like `name` and `description` are standard Doulevo template data, others like `packageVersion` are specific to the particular plugin, in this case the Node.js plugin, and are defined in the file `template.json` which we looked at a moment ago.

Files under the `assets` directory that aren't specified in the `expand` field in `template.json` are not expanded with template data, instead they are simply copied to the user's project directory when the user invokes `doulevo create`.

# Template files

Template Docker and Kubernetes files are stored under the `template-files` directory in the plugin repo. These template files are expanded when various Doulevo commands like `build`, `publish`, `up` and `deploy` are invoked.

For example when invoking `doulevo up`  for the Node.js plugin the development Dockerfile is expanded before running `docker build` and `docker run` to build and run the container.

This is what Dockerfile-dev looks like for the Node.js plugin:

```
FROM node:{{nodeJsVersion}}

WORKDIR /usr/src/app
COPY package*.json ./

CMD npm config set cache-min 9999999 && \
    npm install && \
    npm run start:dev
```

All the files in `template-files` go through template expansion before being used, note in the above example the template expansion in double curly brackets. `{{nodeJsVersion}}` is a template expansion based on plugin-specific questions asked to the user when the project was created.

# Steps to creating a plugin

1. Create a Git repo to host the plugin. Official plugins are hosted under [the Doulevo organisation](https://github.com/doulevo) with a name `plugin-<project-type>`, for example the repo for the official Node.js plugin is called `plugin-nodejs`.
2. The *create template* for the plugin (this is the template starter project) is a simple hello world style program (the simplest possible program for the type of project, e.g. the sipmlest possible Node.js program) and is stored under the `create-template` directory of the plugin's repo ([click here to see the directory in the Node.js plugin](https://github.com/doulevo/plugin-nodejs/tree/main/create-template)).
   1. The file `template.json` is a configuration file for the create template.
   2. The `assets` directory contains the files for the project that will go through template expansion to create a project for the user.
3. Create Dockerfiles and Kubernetes files to build, run and deploy the project. Put these files under the `template-files` directory, [see the Node.js plugin for examples](https://github.com/doulevo/plugin-nodejs/tree/main/template-files/).
4. Test that your plugin works with Doulevo (see below).
5. Publish the files in the Git repo.

# Testing your plugin

There are multiple ways to test your plugin.

First install Doulevo according to the instructions in [the readme](README) or be setup with the development version of Doulevo according [the developer instructions](Developer).

## Creating a project from your plugin

First test that you can create a project from your plugin using `doulovo create`.

### Creating a project with your local plugin

(Using the --force argument to overwrite the previous project)

```bash
doulevo create my-project --force --local-plugin=<path-to-your-plugin> --debug
```

### Creating a project with your plugin hosted on GitHub

```bash
doulevo create my-project --force --plugin-url=https://github.com/username/your-plugin-repo.git --debug
```

### Creating a project form your plugin when it becomes an official Doulevo plugin

```bash
doulevo create my-project --force --project-type=my-project-type --debug
```

## Building the project

```bash
doulevo build --project=./some-project --local-plugin=<path-to-your-plugin> --debug
```

### Dev mode:

```bash
doulevo build --mode=dev --project=./some-project --local-plugin=<path-to-your-plugin> --debug
```

#### Prod mode:

```bash
doulevo build --mode=prod --project=./some-project --local-plugin=<path-to-your-plugin> --debug
```

## Running a project

```bash
doulevo up --project=./some-project --local-plugin=<path-to-your-plugin> --debug
```

### Dev mode:

```bash
doulevo up --mode=dev --project=./some-project --local-plugin=<path-to-your-plugin> --debug
```

### Prod mode:

```bash
doulevo up --mode=prod --project=./some-project --local-plugin=<path-to-your-plugin> --debug
```

## Stopping a project

```bash
doulevo down --project=./some-project --local-plugin=<path-to-your-plugin> --debug
```

## Deploying a project

```bash
doulevo deploy --project=./some-project --local-plugin=<path-to-your-plugin> --debug
```
