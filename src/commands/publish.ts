import { ILog, InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IDoulevoCommand, IDoulevoCommandDesc } from "../lib/doulevo-command";
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
export class PublishCommand implements IDoulevoCommand {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IDocker_id)
    docker!: IDocker;

    @InjectProperty(IFs_id)
    fs!: IFs;

    async invoke(): Promise<void> {

        const projectPath = this.configuration.getArg("project") || this.environment.cwd();

        const configurationFilePath = joinPath(projectPath, "doulevo.json");
        const configurationFile = await this.fs.readJsonFile(configurationFilePath);
        const project = new Project(projectPath, configurationFile);

        const pluginPath = project.getLocalPluginPath();
        if (!pluginPath) {
            throw new Error(`Failed to determine local plugin path for project!`);
        }
        const pluginConfigurationFilePath = joinPath(pluginPath, "plugin.json");
        const pluginConfigurationFile = await this.fs.readJsonFile(pluginConfigurationFilePath);
        const plugin = new Plugin({ path: pluginPath }, pluginConfigurationFile); 

        await this.docker.publish(project, plugin);
    }
}

const command: IDoulevoCommandDesc = {
    name: "publish",
    constructor: PublishCommand,
    help: {
        usage: "doulevo publish [options]",
        message: "Builds and publishes the image for the project.",
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