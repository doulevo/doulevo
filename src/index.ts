const minimist = require("minimist");
const path = require("path");

//
// https://stackoverflow.com/a/26227660/25868
//
// process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")

async function main(): Promise<void> {
    const argv = minimist(process.argv.slice(2));

    console.log("Hello world!");
    
    console.log("Arguments: ");
    
    console.log(argv);
    
    if (argv.plugin) {
        console.log(`Invoking plugin ${argv.plugin}.`);
        require(path.join(__dirname, "../plugins", argv.plugin));
    }
    
    console.log("HOME: " + process.env.HOME);
    console.log("APPDATA: " + process.env.APPDATA);
    console.log("Platform: " + process.platform);
}

main()
    .catch(err => {
        console.error(`Failed:`);
        console.error(err);
        process.exit(1);
    });