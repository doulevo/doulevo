//
// Manages plugins for Doulevo.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import * as inquirer from "inquirer";
import * as path from "path";
import * as fs from "fs-extra";
import { runCmd } from "./run-cmd";
import { IEnvironment, IEnvironment_id } from "./environment";
import { IConfiguration, IConfiguration_id } from "./configuration";
import { ILog, ILog_id } from "./log";

export const IPluginManager_id = "IPluginManager";

export interface IPluginManager {

    //
    // Gets the local path for a plugin.
    //
    getPluginLocalPath(): Promise<string>;

    //
    // Gets the local path for the "create" template.
    //
    getCreateTemplatePath(): Promise<string>;
}

@InjectableSingleton(IPluginManager_id)
class PluginManager implements IPluginManager {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(ILog_id)
    log!: ILog;

    //
    // Gets the local path for a plugin.
    //
    async getPluginLocalPath(): Promise<string> {
        let localPluginPath = this.configuration.getArg("local-plugin");
        if (localPluginPath === undefined) {
    
            let pluginUrl = this.configuration.getArg("plugin-url");
            if (pluginUrl === undefined) {
                //
                // Get the project type.
                //
                let projectType = this.configuration.getArg("project-type");
                if (!projectType) {
                    const projectTypeQuestion = {
                        type: "list",
                        name: "PROJECT_TYPE",
                        message: "Choose the type of the project (more choices comming in the future): ", 
                        choices: [ //TODO: Get choices from some kind of manifest.
                            {
                                name: "Node.js",
                                value: "nodejs",
                            },
                        ],
                    };

                    //
                    // Ask user for project type.
                    //
                    const answers = await inquirer.prompt([ projectTypeQuestion ]);
                    projectType = answers.PROJECT_TYPE;
                }
    
                pluginUrl = `https://github.com/doulevo/plugin-${projectType}.git`;
            }
    
            const pluginDir = path.parse(pluginUrl).name;
    
            //
            // Download and cache the plugin for this type of project.
            //
            const pluginsCachePath = path.join(this.environment.getAppDataDirectory(), "plugins")
            localPluginPath = path.join(pluginsCachePath, pluginDir); 
            const pluginExists = await fs.pathExists(localPluginPath);
            if (!pluginExists) {
            
                // Download the plugin.
                await runCmd(`git clone ${pluginUrl} ${localPluginPath}`);
        
                this.log.verbose(`Downloaded plugin to ${localPluginPath}.`);
            }
            else {
                this.log.verbose(`Plugin already cached at ${localPluginPath}.`);
            }
        }
        else {
            this.log.verbose(`Loading local plugin from ${localPluginPath}.`);
        }
        
        return localPluginPath;
    }

    //
    // Gets the local path for the "create" template.
    //
    async getCreateTemplatePath(): Promise<string> {
        return path.join(await this.getPluginLocalPath(), "create-template");
    }

}