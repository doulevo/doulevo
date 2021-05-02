# Doulevo

A platform that simplifies application development and deployment. 

Doulevo is a command line tool and backend to simplify development and deployment of cloud-based applications.

To learn more watch the video:
https://youtu.be/BFayOne9LZk

Or read the blog post:
https://www.the-data-wrangler.com/simplifying-application-deployment-with-doulevo

My intention is to develop Doulevo as an open source project in this code repository.

If you like the idea please star this repo.

[Follow the developer on Twitter for updates](https://twitter.com/ashleydavis75).

---

This is a prototype version of Doulevo. 

**Don't it use in production.**

## Pre reqs

Have Node.js v12.16.3 installed. Nexe (the bundler) doesn't yet work with Node.js 14.

Use NVM to ensure you have the right version of Node.js installed.

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

## Testing

Some commands for testing...

### Testing with a local template project

```bash
npx ts-node src/index.ts create test-project --force --local-template=c:/projects/doulevo/templates/nodejs
```

### Testing with a remote template project

```bash
npx ts-node src/index.ts create test-project --force --template-url=https://github.com/doulevo/create-template-nodejs.git
```

### Using the default template for the project type

```bash
npx ts-node src/index.ts create test-project --force --project-type=nodejs
```
