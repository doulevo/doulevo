//
// Manages plugins for Doulevo.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import * as path from "path";
import * as fs from "fs-extra";
import { runCmd } from "./run-cmd";
import { IEnvironment, IEnvironment_id } from "./environment";
import { IConfiguration, IConfiguration_id } from "./configuration";
import { ILog, ILog_id } from "./log";

export const IPluginManager_id = "IPluginManager";

export interface IPluginManager {

    //
    // Clones or updates the local version of the plugin if necessary.
    //
    updatePlugin(): Promise<void>;
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
    // Clones or updates the local version of the plugin if necessary.
    //
    async updatePlugin(): Promise<void> {

        let localPluginPath = this.configuration.getLocalPluginPath();
        if (localPluginPath === undefined) {
   
            let pluginUrl = this.configuration.getPluginUrl();
            if (pluginUrl === undefined) {
                //
                // Get the project type, request it from the user it not specified in the configuration.
                //
                const projectType = await this.configuration.requestProjectType();
                pluginUrl = `https://github.com/doulevo/plugin-${projectType}.git`;
                this.configuration.setPluginUrl(pluginUrl);
            }
    
            const pluginDir = path.parse(pluginUrl).name;
    
            //
            // Download and cache the plugin for this type of project.
            //
            const pluginsCachePath = path.join(this.environment.getAppDataDirectory(), "plugins")
            localPluginPath = path.join(pluginsCachePath, pluginDir); 
            this.configuration.setLocalPluginPath(localPluginPath);
            this.configuration.setRelativePluginPath(path.join("^", pluginDir));

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
            this.log.verbose(`Using local plugin at ${localPluginPath}.`);
        }
    }

}