import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IDoulevoCommand, IDoulevoCommandDesc } from "../lib/doulevo-command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";
import { Plugin } from "../lib/plugin";

@InjectableClass()
export class DownCommand implements IDoulevoCommand {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IDocker_id)
    docker!: IDocker;

    @InjectProperty(IFs_id)
    fs!: IFs;

    async invoke(): Promise<void> {

        //
        // The down command operates against the current working directory.
        // Or the path can be set with the --project=<path> argument.
        //
        const projectPath = this.configuration.getArg("project") || this.environment.cwd();

        //
        // Load the project's configuration file.
        //
        const configurationFilePath = joinPath(projectPath, "doulevo.json");
        const configurationFile = await this.fs.readJsonFile(configurationFilePath);
        const project = new Project(projectPath, configurationFile);

        //
        // Stop the container
        //
        await this.docker.down(project, false);
    }
}

const command: IDoulevoCommandDesc = {
    name: "down",
    constructor: DownCommand,
    help: {
        usage: "doulevo down [options]",
        message: "Stops the container for the project.",
        options: [
            {
                name: "--project=<path>",
                message: "Sets the path to the project, defaults to the working directory if not specified.",
                defaultValue: "<current directory>",
            },          
        ],
    }
};

export default command;
