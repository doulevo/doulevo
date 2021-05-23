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


### Creating a project with a local plugin

```bash
npx ts-node src/index.ts create test-project --force --local-plugin=./test-plugin --debug
```

### Creating a project with a remote plugin

```bash
npx ts-node src/index.ts create test-project --force --plugin-url=https://github.com/doulevo/plugin-nodejs.git --debug
```

### Creating a project using the default plugin for the project type

```bash
npx ts-node src/index.ts create test-project --force --project-type=nodejs --debug
```
### No project type specified, asks the user

```bash
npx ts-node src/index.ts create test-project --force --debug
```

### Printing the version number

```bash
npx ts-node src/index.ts --version
```

### Printing help

Use the `help` command:

```bash
npx ts-node src/index.ts --help
```

Or no command:

```bash
npx ts-node src/index.ts
```

Or get help for a sub command, eg:

```bash
npx ts-node src/index.ts create --help
```

### Building the project

```bash
npx ts-node src/index.ts build --project=./test-project --local-plugin=./test-plugin --debug
```

Dev mode:

```bash
npx ts-node src/index.ts build --project=./test-project --local-plugin=./test-plugin --mode=dev --debug
```

Prod mode:

```bash
npx ts-node src/index.ts build --project=./test-project --local-plugin=./test-plugin --mode=prod --debug
```

### Running a project

```bash
npx ts-node src/index.ts up --project=./test-project --local-plugin=./test-plugin --debug
```

Dev  mode:

```bash
npx ts-node src/index.ts up --project=./test-project --local-plugin=./test-plugin --mode=dev --debug
```

Prod mode:

```bash
npx ts-node src/index.ts up --project=./test-project --local-plugin=./test-plugin --mode=prod --debug
```

Detached:

```bash
npx ts-node src/index.ts up -d --project=./test-project --local-plugin=./test-plugin --debug
```

### Stoping a project

```bash
npx ts-node src/index.ts down --project=./test-project --local-plugin=./test-plugin --debug
```

### Viewing logs

```bash
npx ts-node src/index.ts logs --project=./test-project --local-plugin=./test-plugin --debug
```

Follow:

```bash
npx ts-node src/index.ts logs --follow --project=./test-project --local-plugin=./test-plugin --debug
```

### Viewing imagesiamges for the project

```bash
npx ts-node src/index.ts ls --project=./test-project --local-plugin=./test-plugin --debug
```

### Viewing containers for the project

```bash
npx ts-node src/index.ts ps --project=./test-project --local-plugin=./test-plugin --debug
```
