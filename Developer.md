# Doulevo developers guide


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

### Printing the version number

```bash
npx ts-node src/index.ts --version
```

### Printing help

Use the `help` command:

```bash
npx ts-node src/index.ts help
```

Or no command:

```bash
npx ts-node src/index.ts
```

### Building the project.

```bash
npx ts-node src/index.ts build --project=./test-project --local-plugin=c:/projects/doulevo/plugins/nodejs
```

Dev  mode:

```bash
npx ts-node src/index.ts build --project=./test-project --local-plugin=c:/projects/doulevo/plugins/nodejs --mode=dev
```

Prod mode:

```bash
npx ts-node src/index.ts build --project=./test-project --local-plugin=c:/projects/doulevo/plugins/nodejs --mode=prod
```