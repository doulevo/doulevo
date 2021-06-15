import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ICommand, ICommandDesc } from "../command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";
import { Plugin } from "../lib/plugin";

@InjectableClass()
export class UpCommand implements ICommand {

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
        // The up command operates against the current working directory.
        // Or the path can be set with the --project=<path> argument.
        //
        const projectPath = this.configuration.getArg("project") || this.environment.cwd();

        //
        // Load the project's configuration file.
        //
        const configurationFilePath = joinPath(projectPath, "doulevo.json");
        const configurationFile = await this.fs.readJsonFile(configurationFilePath);
        const project = new Project(projectPath, configurationFile);

        const mode = this.configuration.getArg("mode") || "dev";
        if (mode !== "release" && mode !== "dev") {
            throw new Error(`--mode can only be either "dev" or "release".`);
        }

        //
        // Tags that can identify the image.
        //
        const tags = this.configuration.getArrayArg("tag");

        const isDetached = this.configuration.getArg<boolean>("d") || this.configuration.getArg<boolean>("detached") || false;

        //
        // Load the plugin for this project.
        //
        const pluginPath = project.getLocalPluginPath();
        if (!pluginPath) {
            throw new Error(`Failed to determine local plugin path for project!`);
        }
        const pluginConfigurationFilePath = joinPath(pluginPath, "plugin.json");
        const pluginConfigurationFile = await this.fs.readJsonFile(pluginConfigurationFilePath);
        const plugin = new Plugin({ path: pluginPath }, pluginConfigurationFile); 

        //
        // Do the build.
        //
        // TODO: Choose the current build plugin (eg "build/docker") based on project configuration.
        //
        await this.docker.up(project, mode, tags, plugin, isDetached);
    }
}

const command: ICommandDesc = {
    name: "up",
    constructor: UpCommand,
    help: {
        usage: "doulevo up [options]",
        description: "Builds the image and runs the container for the project.",
        options: [
            {
                name: "--project=<path>",
                description: "Sets the path to the project, defaults to the working directory if not specified.",
                defaultValue: "<current directory>",
            },          
            {
                name: `--mode={dev|release}`,
                description: "Sets the mode for the build process, can be either of dev or release.",
                defaultValue: "dev",
            },
            {
                name: "--tag=<tag>",
                description: "Adds a tag to the Docker image that is built. Use multiple times to apply multiple tags.",
            },
            {
                name: "--detatched, --d",
                description: "Runs the container in detached mode. If not specified the terminal remains attached to the container to view its output.",
            },
            
        ],
    }
};

export default command;
