const minimist = require("minimist");
const path = require("path");

const argv = minimist(process.argv.slice(2));

console.log("Hello world!");

console.log("Arguments: ");

console.log(argv);

if (argv.plugin) {
    console.log(`Invoking plugin ${argv.plugin}.`);
    require(path.join(__dirname, "../plugins", argv.plugin));
}