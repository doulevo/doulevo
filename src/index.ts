import * as minimist from "minimist";
import * as path from "path";
import CreateCommand from "./commands/create";
import { ICommand } from "./lib/command";
// import up from "./commands/up";
// import deploy from "./commands/deploy";
// import build from "./commands/build";
// import down from "./commands/down";
// import eject from "./commands/eject";

const commands: any = {
    create: CreateCommand,
};

async function main(): Promise<void> {
    const argv = minimist(process.argv.slice(2));

    // console.log("HOME: " + process.env.HOME);

    // https://stackoverflow.com/a/26227660/25868
    const APPDATA = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    const appData = path.join(`${APPDATA}/doulevo`);
    // console.log("APPDATA: " + appData);
    // console.log("Platform: " + process.platform);

    if (argv._.length > 0) {
        const cmd = argv._[0];
        const cmdArgv = Object.assign({}, argv, { _: argv._.slice(1) })
        const Command = commands[cmd];
        if (Command === undefined) {
            throw new Error(`Unexpected command ${cmd}`);
        }
        const command: ICommand = new Command();
        await command.invoke(cmdArgv, appData);
    }
}

main()
    .catch(err => {
        console.error(`Failed:`);
        console.error(err);
        process.exit(1);
    });