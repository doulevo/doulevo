import { ICommand } from "../lib/command";
import { IPluginManager, IPluginManager_id } from "../services/plugin-manager";
import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IConfiguration, IConfiguration_id } from "../services/configuration";
import { ILog, ILog_id } from "../services/log";
import { runCmd } from "../lib/run-cmd";
import { joinPath } from "../lib/join-path";
import { IFs, IFs_id } from "../services/fs";
import { ITemplateManager, ITemplateManager_id } from "../services/template-manager";

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

    @InjectProperty(ITemplateManager_id)
    templateManager!: ITemplateManager;

    async invoke(): Promise<void> {
    
        const projectDir = this.configuration.getMainCommand();
        if (!projectDir) {
            throw new Error(`Project directory not specified. Use "doulevo create <project-dir>`);
        }
    
        const projectPath = joinPath(process.cwd(), projectDir);
        const projectExists = await this.fs.exists(projectPath);
        if (projectExists) {
            const force = this.configuration.getArg<boolean>("force");
            if (force) {
                await this.fs.remove(projectPath);
            }
            else {
                throw new Error(`Directory already exists at ${projectPath}, please delete the existing directory if you want to create a new project here`);
            }
        }
    
        //
        // Clone or update the plugin requested by the configuration.
        //
        await this.pluginManager.updatePlugin();

        //
        // Exports the create-template, filling in the blanks.
        //
        await this.templateManager.export(projectPath);   

        await runCmd(`git init`, { cwd: projectPath });
        await runCmd(`git add .`, { cwd: projectPath });
        await runCmd(`git commit -m "Project generated from Doulevo template."`, { cwd: projectPath });
    
        this.log.info(`Created project at ${projectPath}`)
    } 
}

export default {
    name: "create",
    description: "Creates a new Doulevo project.",
    constructor: CreateCommand,
};