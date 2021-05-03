import * as minimist from "minimist";
import CreateCommand from "./commands/create";
import { ICommand } from "./lib/command";
// import up from "./commands/up";
// import deploy from "./commands/deploy";
import BuildCommand from "./commands/build";
import { Configuration, IConfiguration_id } from "./lib/configuration";
import { registerSingleton } from "@codecapers/fusion";
// import down from "./commands/down";
// import eject from "./commands/eject";

const commands: any = {
    create: CreateCommand,
    build: BuildCommand,
};

async function main(): Promise<void> {
    const argv = minimist(process.argv.slice(2));
    
    if (argv._.length > 0) {
        const cmd = argv._[0];
        const cmdArgv = Object.assign({}, argv, { _: argv._.slice(1) })
        const configuration = new Configuration(cmdArgv);
        registerSingleton(IConfiguration_id, configuration);
        const Command = commands[cmd];
        if (Command === undefined) {
            throw new Error(`Unexpected command ${cmd}`);
        }
        const command: ICommand = new Command();
        await command.invoke();
    }
}

main()
    .catch(err => {
        console.error(`Failed:`);
        console.error(err);
        process.exit(1);
    });