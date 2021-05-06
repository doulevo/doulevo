import { ILog, InjectableClass, InjectProperty } from "@codecapers/fusion";
import { commands } from "../commands";
import { ICommand } from "../lib/command";
import { ILog_id } from "../services/log";

@InjectableClass()
class HelpCommand implements ICommand {

    @InjectProperty(ILog_id)
    log!: ILog;

    async invoke(): Promise<void> {
        
        this.log.info(`\nUsage: doulevo <command> [options]\n`);
        this.log.info(`Simplifying the development and deployment of cloud-based applications.\n`);

        this.log.info(`Commands:`);

        for (const command of commands) {
            this.log.info(" ".repeat(4) + command.name.padEnd(10) + command.description);
        }

        this.log.info(`\nOptions:`);

        const optionPadding = 25;
        this.log.info(" ".repeat(4) + "--version".padEnd(optionPadding) + "Displays the current version number.");
        this.log.info(" ".repeat(4) + "--non-interactive".padEnd(optionPadding) + "Runs in non-interactive mode. All questions will default, except project-type, if you have to set the project type, use the --project-type options.");
        this.log.info(" ".repeat(4) + "--project-type=<type>".padEnd(optionPadding) + "Sets the type of project to create (if not specified you'll be asked).");
        this.log.info(" ".repeat(4) + "--project=<path>".padEnd(optionPadding) + "Sets the path to the project, defaults to the working directory if not specified.");
        this.log.info(" ".repeat(4) + "--plugin-url=<url>".padEnd(optionPadding) + "Sets the URL of the Git repo for the plugin (no need to set project type if you use this).");
        this.log.info(" ".repeat(4) + "--local-plugin=<path>".padEnd(optionPadding) + "Sets the local path for a plugin (good for testing when you are developing a plugin).");
        this.log.info(" ".repeat(4) + "--mode={dev|prod}".padEnd(optionPadding) + "Sets the mode for the build process, can be either dev or prod.");

        this.log.info(" ".repeat(4) + "--force".padEnd(optionPadding) + "Forces the command to be completed (even if it would overite existing files).");
        this.log.info(" ".repeat(4) + "--verbose".padEnd(optionPadding) + "Enables versbose logging.");
        this.log.info(" ".repeat(4) + "--quiet".padEnd(optionPadding) + "Tuns in quiet mode, supresses logging unless absolutely necessary.");
        this.log.info(" ".repeat(4) + "--debug".padEnd(optionPadding) + "Enables debug logging.");
        
    }
}

export default {
    name: "help",
    description: "Displays help.",
    constructor: HelpCommand,
};
