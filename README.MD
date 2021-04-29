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