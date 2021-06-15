import { ILog, InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ICommand, ICommandDesc } from "../command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";
import { Plugin } from "../lib/plugin";
import { IProgressIndicator, IProgressIndicator_id } from "../services/progress-indicator";
import { ILog_id } from "../services/log";

@InjectableClass()
export class BuildCommand implements ICommand {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IDocker_id)
    docker!: IDocker;

    @InjectProperty(IFs_id)
    fs!: IFs;

    @InjectProperty(IProgressIndicator_id)
    progressIndicator!: IProgressIndicator;

    @InjectProperty(ILog_id)
    log!: ILog;

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

        const mode = this.configuration.getArg("mode") || "dev";
        if (mode !== "release" && mode !== "dev") {
            throw new Error(`--mode can only be either "dev" or "release".`);
        }

        //
        // Tags that can identify the image.
        //
        const tags = this.configuration.getArrayArg("tag");

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
        await this.docker.build(project, mode, tags, plugin);

        const images = await this.docker.listProjectImages(project, mode);
        this.log.info(`Created images:`);
        for (const image of images) {
            this.log.info(`    ${image.ID} ${image.Repository}:${image.Tag} ${image.Size}`);
        }
    }
}

const command: ICommandDesc = {
    name: "build",
    constructor: BuildCommand,
    help: {
        usage: "doulevo build [options]",
        description: "Builds the image for the project.",
        options: [
            {
                name: "--project=<path>",
                description: "Sets the path to the project, defaults to the working directory if not specified.",
                defaultValue: "<current directory>",
            },          
            {
                name: "--mode={dev|release}",
                description: "Sets the mode for the build process, can be either of dev or release.",
                defaultValue: "dev",
            },
            {
                name: "--tag=<tag>",
                description: "Adds a tag to the Docker image that is built. Use multiple times to apply multiple tags.",
            },
        ],
    }
};

export default command;