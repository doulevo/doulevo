import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IDoulevoCommand, IDoulevoCommandDesc } from "../lib/doulevo-command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";
import { Plugin } from "../lib/plugin";
import { IProgressIndicator, IProgressIndicator_id } from "../services/progress-indicator";
import { IKubernetes, IKubernetes_id } from "../plugins/kubernetes";

@InjectableClass()
export class DeployCommand implements IDoulevoCommand {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IDocker_id)
    docker!: IDocker;

    @InjectProperty(IKubernetes_id)
    kubernetes!: IKubernetes;

    @InjectProperty(IFs_id)
    fs!: IFs;

    @InjectProperty(IProgressIndicator_id)
    progressIndicator!: IProgressIndicator;

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

        await this.kubernetes.deploy(project, plugin);
    }
}

const command: IDoulevoCommandDesc = {
    name: "deploy",
    constructor: DeployCommand,
    help: {
        usage: "doulevo deploy [options]",
        message: "Builds the image and deploys containers to the backend for the project.",
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
