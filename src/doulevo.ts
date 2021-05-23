//
// The Doulevo application.
//

import { ILog, InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IEnvironment, IEnvironment_id } from "./services/environment";
import { ILog_id } from "./services/log";
import { IConfiguration, IConfiguration_id } from "./services/configuration";
import { IDetectInterrupt, IDetectInterrupt_id } from "./services/detect-interrupt";
import { IDoulevoCommand, IDoulevoCommandDesc, IDoulevoCommandHelp } from "./lib/doulevo-command";
const packageInfo = require("../package.json");

import { commands } from "./commands";
import chalk = require("chalk");

//
// Cache commands for lookup.
//
const commandMap: any = {};
for (const command of commands) {
    commandMap[command.name] = command;
}

@InjectableClass()
export class Doulevo {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IDetectInterrupt_id)
    detectInterrupt!: IDetectInterrupt;

    async invoke(): Promise<void> {
        
        try {
            const showInfo = this.configuration.getArg<boolean>("info") || this.configuration.isDebug();
            if (showInfo) {
                this.configuration.info();
                this.environment.info();
            }
    
            if (this.configuration.getArg<boolean>("version")) {
                this.log.info(`Doulevo v${packageInfo.version}`);
                return;
            }
    
            let cmd = this.configuration.getMainCommand();
    
            const help = this.configuration.getArg<boolean>("help");
            if (help) {
                if (cmd === undefined) {
                    this.showGeneralHelp();
                    return;
                }
                else {
                    const command = commandMap[cmd];
                    if (command === undefined) {
                        throw new Error(`Unexpected command ${cmd}`);
                    }

                    this.showCommandHelp(command);
                    return;
                }
            }
    
            if (cmd === undefined) {
                this.showGeneralHelp();
                return;
            }
    
            // Consumes the main command, allows the next nested sub command to bubble up and be the new main command.
            this.configuration.consumeMainCommand(); 
    
            const Command = commandMap[cmd].constructor;
            if (Command === undefined) {
                throw new Error(`Unexpected command ${cmd}`);
            }
            const command: IDoulevoCommand = new Command();
            await command.invoke();
    
        }
        finally {
            // Close the interrupt detecter so it doesn't keep Node.js running.
            await this.detectInterrupt.close(); 
        }
    }

    //
    // Shows general help for Doulevo.
    //
    private showGeneralHelp(): void {
        this.showHelp({
            usage: `doulevo <command> [options]`,
            message: `Simplifying the development and deployment of cloud-based applications.`,
            arguments: [
                [ "--version", "Displays the current version number." ],
                [ "--non-interactive", "Runs in non-interactive mode. All questions will default, except project-type, if you have to set the project type, use the --project-type options." ],
                [ "--project=<path>", "Sets the path to the project, defaults to the working directory if not specified." ],
                [ "--plugin-url=<url>", "Sets the URL of the Git repo for the plugin (no need to set project type if you use this)." ],
                [ "--local-plugin=<path>", "Sets the local path for a plugin (good for testing when you are developing a plugin)." ],
                [ "--mode={dev|prod}", "Sets the mode for the build process, can be either dev or prod." ],
                [ "--force", "Forces the command to be completed (even if it would overwite existing files)." ],
                [ "--verbose", "Enables versbose logging." ],
                [ "--quiet", "Tuns in quiet mode, supresses logging unless absolutely necessary." ],
                [ "--debug", "Enables debug logging." ],
            ],
        })
    }

    //
    // Shows help for a sub-command.
    //
    private showCommandHelp(command: IDoulevoCommandDesc): void {
        this.showHelp(command.help);
    }

    //
    // Formats help described in the "help" object.
    //
    private showHelp(help: IDoulevoCommandHelp): void {
        this.log.info(`\nUsage: ${chalk.blueBright(help.usage)}\n`);
        this.log.info(`${help.message}\n`);

        this.log.info(`Options:`);

        const padding = " ".repeat(4);
        const optionsPadding = 25;

        for (const [argName, argDesc] of help.arguments) {
            this.log.info(`${padding}${argName!.padEnd(optionsPadding)}${argDesc}`)
        }
    }
}