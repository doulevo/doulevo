//
// The Doulevo application.
//

import { ILog, InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IEnvironment, IEnvironment_id } from "./services/environment";
import { ILog_id } from "./services/log";
import { IConfiguration, IConfiguration_id } from "./services/configuration";
import { IDetectInterrupt, IDetectInterrupt_id } from "./services/detect-interrupt";
import { IDoulevoCommand, IDoulevoCommandDesc, IDoulevoCommandHelp, IOptionHelp } from "./lib/doulevo-command";
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

                    this.showCommandHelp(command, this.globalOptions);
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

    private globalOptions = [
        {
            name: "--help",
            message: "Shows help for doulevo and sub-commands.",
        },
        {
            name: "--version",
            message: "Displays the current version number.",
        },
        {
            name: "--non-interactive",
            message: "Runs in non-interactive mode. All questions will default, except project-type, if you have to set the project type, use the --project-type options.",
        },
        {
            name: "--verbose",
            message: "Enables verbose logging.",
        },
        {
            name: "--quiet",
            message: "Enables quiet mode, supresses logging unless absolutely necessary.",
        },
        {
            name: "--debug",
            message: "Enables debug logging.",
        },
    ];

    //
    // Shows general help for Doulevo.
    //
    private showGeneralHelp(): void {
        this.showHelp({
            usage: `doulevo <command> [options]`,
            message: `Simplifying the development and deployment of cloud-based applications.`,
            subCommands: commands,
            options: this.globalOptions,
        });
    }

    //
    // Shows help for a sub-command.
    //
    private showCommandHelp(command: IDoulevoCommandDesc, globalOptions?: IOptionHelp[]): void {
        this.showHelp(command.help, globalOptions);
    }

    //
    // Formats help described in the "help" object.
    //
    private showHelp(commandHelp: IDoulevoCommandHelp, globalOptions?: IOptionHelp[]): void {

        const usage = commandHelp.usage
            .replace("<command>", `<${chalk.blueBright("command")}>`)
            .replace("[options]", `[${chalk.greenBright("options")}]`)

        this.log.info(`\nUsage: ${usage}\n`);
        this.log.info(`${commandHelp.message}`);
        
        const padding = " ".repeat(4);
        const columnPadding = 25;
        
        if (commandHelp.subCommands) {
            this.log.info(`\n${chalk.blueBright("Commands")}:`);

            for (const subCommand of commandHelp.subCommands) {
                this.log.info(`${padding}${subCommand.name.padEnd(columnPadding)}${subCommand.help.message}`)
            }
        }

        this.showOptions("Options", commandHelp.options, padding, columnPadding);
        this.showOptions("Global options", globalOptions, padding, columnPadding);
    }

    private showOptions(name: string, options: IOptionHelp[] | undefined, padding: string, columnPadding: number) {
        if (options) {
            this.log.info(`\n${chalk.greenBright(name)}:`);

            for (const option of options) {
                this.log.info(`${padding}${option.name.padEnd(columnPadding)}${option.message}`);
                if (option.defaultValue !== undefined) {
                    this.log.info(`${padding}${" ".padEnd(columnPadding)}Default = ${chalk.cyan(option.defaultValue)}`);
                }
            }
        }
    }
}