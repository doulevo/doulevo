import { ICommand, ICommandDesc } from "../command";
import { IPluginManager, IPluginManager_id } from "../services/plugin-manager";
import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IConfiguration, IConfiguration_id } from "../services/configuration";
import { ILog, ILog_id } from "../services/log";
import { joinPath } from "../lib/join-path";
import { IFs, IFs_id } from "../services/fs";
import { ITemplateManager, ITemplateManager_id } from "../services/template-manager";
import { IGit, IGit_id } from "../services/git";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { Plugin } from "../lib/plugin";

@InjectableClass()
export class CreateCommand implements ICommand {

    @InjectProperty(IPluginManager_id)
    pluginManager!: IPluginManager;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IFs_id)
    fs!: IFs;

    @InjectProperty(IGit_id)
    git!: IGit;

    @InjectProperty(ITemplateManager_id)
    templateManager!: ITemplateManager;

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    async invoke(): Promise<void> {

        const projectDir = this.configuration.getMainCommand();
        if (!projectDir) {
            throw new Error(`Project directory not specified. Use "doulevo create <project-dir>`);
        }

        const projectPath = joinPath(this.environment.cwd(), projectDir);
        const projectExists = await this.fs.exists(projectPath);
        if (projectExists) {
            const force = this.configuration.getArg<boolean>("force");
            if (force) {
                await this.fs.remove(projectPath);
            }
            else {
                throw new Error(`Directory already exists at ${projectPath}, please delete the existing directory, or use the --force flag if you want to create a new project here`);
            }
        }
   
        //
        // Clone or update the plugin requested by the configuration.
        //
        const pluginDetails = await this.pluginManager.updatePlugin();

        //
        // Load the plugin for this project.
        //
        const pluginConfigurationFilePath = joinPath(pluginDetails.path, "plugin.json");
        const pluginConfigurationFile = await this.fs.readJsonFile(pluginConfigurationFilePath);
        const plugin = new Plugin(pluginDetails, pluginConfigurationFile); 

        //
        // Exports the create-template, filling in the blanks.
        //
        await this.templateManager.exportTemplate(projectDir, projectPath, plugin);

        //
        // Create a Git repo for the project.
        //
        await this.git.createNewRepo(projectPath, "Project generated from Doulevo template.");
    } 
}

const command: ICommandDesc = {
    name: "create",
    constructor: CreateCommand,
    help: {
        usage: "doulevo create [options] <project-dir>",
        description: `Creates a new Doulevo project at <project-dir>`,
        options: [
            {
                name: "--project-type=<type>",
                description: "Sets the type of project to be created. Omit this to select project type interactively.",
            },
            {
                name: "--local-plugin=<path>",
                description: "Loads the plugin from a path. No need to set --project-type if you use this. It's good for testing when you are developing a plugin."
            },
            {
                name: "--plugin-url=<url>",
                description: "Loads the plugin from the specified Git repo. No need to set --project-type if you use this.",
            },
            {
                name: "--force",
                description: "Deletes and overwrites the project directory if it already exists.",
            },
        ],
    },
};

export default command;

