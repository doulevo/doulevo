import { IDoulevoCommand, IDoulevoCommandDesc } from "../lib/doulevo-command";
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
export class CreateCommand implements IDoulevoCommand {

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

const command: IDoulevoCommandDesc = {
    name: "create",
    description: "Creates a new Doulevo project.",
    constructor: CreateCommand,
    help: {
        usage: "doulevo create [options] <project-dir>",
        message: `Creates a new Doulevo project at <project-dir>`,
        arguments: [
            [ "--force", "Deletes project directory if it already exists." ],
            [ "--local-plugin",  "When set, Doulevo will create the project using the 'local' plugin from the specified location." ],
            [ "--plugin-url",  "When set, Doulevo will create the project using the 'remote' plugin from the specified location." ],
            [ "--project-type",  "When set, Doulevo will create the project using the default plugin for the specified project type." ],
            [ "--help",  "Prints usage for this command." ],
        ],
    }
};

export default command;

