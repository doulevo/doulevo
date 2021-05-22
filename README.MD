# Doulevo

WORK IN PROGRESS, NOT READY FOR PRODUCTION USE

Doulevo is a command line tool and backend to simplify development and deployment of cloud-based applications.

To learn more watch the video:
https://youtu.be/BFayOne9LZk

Or read the blog post:
https://www.the-data-wrangler.com/simplifying-application-deployment-with-doulevo

Doulevo is an open source project developed in this code repository.

If you like the idea please star this repo.

[Follow the developer on Twitter for updates](https://twitter.com/ashleydavis75).

## Become a contributor

Doulevo needs your help! 

Check out [the developer guide](Developer.md)

Email ashley@codecapers.com.au to find out how you can help.

## Give feedback

Doulevo is a work in progress, please email feedback to ashley@codecapers.com.au.

## Write plugins

Doulevo is extensible by the community, [learn how to write a plugin](Plugin-developers-guide.md).

# Installation

## Installing the Doulevo executable

Download the latest release from GitHub:
https://github.com/doulevo/doulevo/releases

Download the appopriate zip file for your platform, unpack it and put the `doulevo` executable in your path.

That's it!

## Installation with Node.js

If you have **Node.js**, you can install Doulevo using `npm`:

```bash
npm install doulevo -g
```

## Basic usage

NOTE: CURRENTLY ONLY THE CREATE COMMAND IS IMPLEMENTED.

To get help:

```bash
doulevo help
```

To create a new Doulevo project:

```bash
doulevo create my-new-service
```

To run your new service:

```bash
cd my-new-service
doulevo up
```

To deploy to production (assuming you have a backend and are authenticated):

```bash
doulevo deploy
```

To learn more read [the user guide](User-guide.md).
