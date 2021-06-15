import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ICommand, ICommandDesc } from "../command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";

@InjectableClass()
export class LsCommand implements ICommand {

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
        // The build command operates against the current working directory.
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
        // Do the build.
        //
        // TODO: Choose the current build plugin (eg "build/docker") based on project configuration.
        //
        await this.docker.ls(project);
    }
}

const command: ICommandDesc = {
    name: "ls",
    constructor: LsCommand,
    help: {
        usage: "doulevo ls [options]",
        description: "Shows images for the project.",
        options: [
            {
                name: "--project=<path>",
                description: "Sets the path to the project, defaults to the working directory if not specified.",
                defaultValue: "<current directory>",
            },     
        ],
    }
};

export default command;
