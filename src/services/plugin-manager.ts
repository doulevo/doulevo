//
// Manages plugins for Doulevo.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import * as path from "path";
import * as fs from "fs-extra";
import { IEnvironment, IEnvironment_id } from "./environment";
import { IConfiguration, IConfiguration_id } from "../services/configuration";
import { ILog, ILog_id } from "./log";
import { joinPath } from "../lib/join-path";
import { IGit, IGit_id } from "./git";
import { IQuestioner, IQuestioner_id } from "./questioner";

export const IPluginManager_id = "IPluginManager";

export interface IPluginManager {

    //
    // Clones or updates the local version of the plugin if necessary.
    // Returns the local path of the plugin.
    //
    updatePlugin(): Promise<string>;
}

@InjectableSingleton(IPluginManager_id)
class PluginManager implements IPluginManager {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IGit_id)
    git!: IGit;

    @InjectProperty(IQuestioner_id)
    questioner!: IQuestioner;

    //
    // Requests the project type from the user if it's not already set in the configuration.
    //
    private async getProjectType(): Promise<string> {
        const projectType = this.configuration.getProjectType();
        if (projectType) {
            return projectType;
        }

        const isNonInteractive = this.configuration.getArg<boolean>("non-interactive");
        if (isNonInteractive) {
            //
            // Need to know the project type, but can't ask the user in non-interactive mode.
            //
            throw new Error(`Running in non-interactive mode, you need to set argument --project-type=<the-project-type>.`);
        }

        //TODO: The manifest could ask a series of questions to figure out which type of plugin.

        const projectTypeQuestion = {
            type: "list",
            name: "projectType",
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
        const answers = await this.questioner.prompt([ projectTypeQuestion ]);
        return answers.projectType;
    }

    //
    // Clones or updates the local version of the plugin if necessary.
    // Returns the local path of the plugin.
    //
    async updatePlugin(): Promise<string> {

        let localPluginPath = this.configuration.getLocalPluginPath();
        if (localPluginPath === undefined) {
   
            let pluginUrl = this.configuration.getPluginUrl();
            if (pluginUrl === undefined) {
                //
                // Get the project type, request it from the user it not specified in the configuration.
                //
                const projectType = await this.getProjectType();
                pluginUrl = `https://github.com/doulevo/plugin-${projectType}.git`;
            }
    
            const pluginDir = path.parse(pluginUrl).name;
    
            //
            // Download and cache the plugin for this type of project.
            //
            const pluginsCachePath = joinPath(this.environment.getAppDataDirectory(), "plugins")
            localPluginPath = joinPath(pluginsCachePath, pluginDir); 

            const pluginExists = await fs.pathExists(localPluginPath);
            if (!pluginExists) {
            
                // Download the plugin.
                await this.git.clone(pluginUrl, localPluginPath);
        
                this.log.verbose(`Downloaded plugin to ${localPluginPath}.`);
            }
            else {
                this.log.verbose(`Plugin already cached at ${localPluginPath}.`);
            }
        }
        else {
            this.log.verbose(`Using local plugin at ${localPluginPath}.`);
        }

        return localPluginPath;
    }
}