//
// The Doulevo application.
//

import { ILog, InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IEnvironment, IEnvironment_id } from "./services/environment";
import { ILog_id } from "./services/log";
import { ICommand } from "./lib/command";
import { IConfiguration, IConfiguration_id } from "./services/configuration";

import CreateCommand from "./commands/create";
import BuildCommand from "./commands/build";
//todo: Other commands
// import up from "./commands/up";
// import deploy from "./commands/deploy";
// import down from "./commands/down";
// import eject from "./commands/eject";

const commands: any = {
    create: CreateCommand,
    build: BuildCommand,
};

@InjectableClass()
export class Doulevo {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    async invoke(): Promise<void> {
        
        const showInfo = this.configuration.getArg<boolean>("info") || this.configuration.getArg<boolean>("debug");
        if (showInfo) {
            this.configuration.info();
            this.environment.info();
        }

        const cmd = this.configuration.getMainCommand();
        if (cmd !== undefined) {
            // Consumes the main command, allows the next nested sub command to bubble up and be the new main command.
            this.configuration.consumeMainCommand(); 

            const Command = commands[cmd];
            if (Command === undefined) {
                throw new Error(`Unexpected command ${cmd}`);
            }
            const command: ICommand = new Command();
            await command.invoke();
        }
        else {
            throw new Error(`Please invoke a subcommand.`); //TODO: Want better help here.
        }    
    }
}