# Build system test

This is a prototype that shows how to build a Node.js application into a self-contained executable.

## Pre reqs

Have Node.js v12.16.3 installed. Nexe (the bundler) doesn't yet work with Node.js 14.

Use NVM to ensure you have the right version of Node.js installed.

### Build the executable

```bash
npm run build
```

The executable is generated to `build-system-test.exe` in the current directory.

Running the executable should print "Hello world!".

### Testing local plugin support

Use the `--plugin` command line argument to test inoking an external code module.

For example:

```bash
build-system-test --plugin=test.js
```

This invokes the code in test.js in the `plugins` subdirectory.

This is just a test to ensure the an app built with Nexe can run external code modules. This might be a good way to support plugins in Doulevo.