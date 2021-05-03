# Doulevo

A platform that simplifies application development and deployment. 

Doulevo is a command line tool and backend to simplify development and deployment of cloud-based applications.

To learn more watch the video:
https://youtu.be/BFayOne9LZk

Or read the blog post:
https://www.the-data-wrangler.com/simplifying-application-deployment-with-doulevo

Doulevo is an open source project developed in this code repository.

If you like the idea please star this repo.

[Follow the developer on Twitter for updates](https://twitter.com/ashleydavis75).

## Become a contributor

Doulevo needs your contribution! 

Please email ashley@codecapers.com.au to find out how you can help.


## Give feedback

Doulevo is a work in progress, please email feedback to ashley@codecapers.com.au.

# Installation

This is a prototype version of Doulevo. 

**Don't it use in production.**

## Installing the Doulevo executable

Download the latest release from GitHub:
https://github.com/doulevo/doulevo/releases

Put `doulevo.exe` in your path.

That's it!

## Installation with Node.js

If you have **Node.js**, you can install Doulevo using `npm`:

```bash
npm install doulevo -g
```

# Development

## Pre reqs

Have Node.js v12.16.3 installed. Nexe (the bundler) doesn't yet work with Node.js 14.

Use NVM to ensure you have the right version of Node.js installed.

## Setup

Fork and clone the Doulevo code repository, then install dependencies:

```bash
cd doulevo
npm install
```

## Run it in development

Run it once:

```bash
npm start
```

Or run it continously with live reload: 

```bash
npm run start:dev
```

## Build the executable

```bash
npm run build-exe
```

The executable is generated to `doulevo.exe` in the current directory.

# Testing

Some commands for testing...

### Testing with a local plugin

```bash
npx ts-node src/index.ts create test-project --force --local-plugin=c:/projects/doulevo/plugins/nodejs
```

### Testing with a remote plugin

```bash
npx ts-node src/index.ts create test-project --force --plugin-url=https://github.com/doulevo/plugin-nodejs.git
```

### Using the default plugin for the project type

```bash
npx ts-node src/index.ts create test-project --force --project-type=nodejs
```
### No project type specified, asks the user

```bash
npx ts-node src/index.ts create test-project --force
```

### Building the project.

```bash
npx ts-node src/index.ts build
```
