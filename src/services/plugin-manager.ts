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
import { IProgressIndicator, IProgressIndicator_id } from "./progress-indicator";

export const IPluginManager_id = "IPluginManager";

//
// Details for the current plugin.
//
export interface IPluginDetails {
    //
    // The type of the project (if provided).
    //
    projectType?: string;

    //
    // URL where the plugin was downloaded from (if provided or generated).
    //
    url?: string;

    //
    // The local path of the plugin.
    //
    path: string;
}

export interface IPluginManager {

    //
    // Clones or updates the local version of the plugin if necessary.
    // Returns the details of the plugin.
    //
    updatePlugin(): Promise<IPluginDetails>;
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

    @InjectProperty(IProgressIndicator_id)
    progressIndicator!: IProgressIndicator;

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
            message: "Choose the type of the project (more choices coming in the future): ", 
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
    async updatePlugin(): Promise<IPluginDetails> {

        let projectType: string | undefined;
        let pluginUrl: string | undefined;
        let pluginPath = this.configuration.getLocalPluginPath();
        if (pluginPath === undefined) {
   
            pluginUrl = this.configuration.getPluginUrl();
            if (pluginUrl === undefined) {
                //
                // Get the project type, request it from the user it not specified in the configuration.
                //
                projectType = await this.getProjectType();
                pluginUrl = `https://github.com/doulevo/plugin-${projectType}.git`;
            }
    
            const pluginDir = path.parse(pluginUrl).name;
    
            //
            // Download and cache the plugin for this type of project.
            //
            const pluginsPath = this.environment.getPluginsDirectory();
            pluginPath = joinPath(pluginsPath, pluginDir); 

            const pluginExists = await fs.pathExists(pluginPath);
            if (!pluginExists) {
            
                this.progressIndicator.start("Updating plugin...");

                try {
                    // Download the plugin.
                    await this.git.clone(pluginUrl, pluginPath);

                    this.progressIndicator.info("Updated plugin.");
                }
                catch (err) {
                    this.progressIndicator.fail("Failed to update plugin.");
                    throw err;
                }
        
                this.log.verbose(`Downloaded plugin to ${pluginPath}.`);
            }
            else {
                this.log.verbose(`Plugin already cached at ${pluginPath}.`);
            }
        }
        else {
            this.log.verbose(`Using local plugin at ${pluginPath}.`);
        }

        return {
            projectType: projectType,
            url: pluginUrl,
            path: pluginPath,
        };
    }
}