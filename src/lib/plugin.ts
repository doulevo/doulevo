//
// Access to the currently selected plugin.
//

import { InjectableClass } from "@codecapers/fusion";
import { runInThisContext } from "node:vm";
import { IPluginDetails } from "../services/plugin-manager";

//
// Defines a directory that is shared between the host OS and the container.
//
export interface ISharedDirectory {
    //
    // The relative path of the directory on the host OS.
    // This is relative to the project directory.
    // 
    host: string;

    //
    // The absolute path fo the directory within the container.
    //
    container: string;
}

export interface IPlugin {


    //
    // Gets the project type for the plugin (if known).
    //
    getProjectType(): string | undefined;

    //
    // Get the URL for the plugin (if known).
    //
    getUrl(): string | undefined;

    //
    // Get the local path for the plugin, if specified.
    //
    getPath(): string; 

    //
    // Gets the directories that are shared between the host OS and the container.
    //
    getSharedDirectories(): ISharedDirectory[]; 
}

@InjectableClass()
export class Plugin implements IPlugin {

    //
    // Details for the plugin.
    //
    private pluginDetails: IPluginDetails;

    //
    // Plugin configuration.
    //
    private configurationFile: any;

    constructor(pluginDetails: IPluginDetails, configurationFile: any) {
        this.pluginDetails = pluginDetails;
        this.configurationFile = configurationFile;
    }

    //
    // Gets the project type for the plugin (if known).
    //
    getProjectType(): string | undefined {
        return this.pluginDetails.projectType;
    }

    //
    // Get the URL for the plugin (if known).
    //
    getUrl(): string | undefined {
        return this.pluginDetails.url;
    }

    //
    // Get the local path for the plugin.
    //
    getPath(): string {
        return this.pluginDetails.path;
    }

    //
    // Gets the directories that are shared between the host OS and the container.
    //
    getSharedDirectories(): ISharedDirectory[] {
        return this.configurationFile.sharedDirectories || [];
    }

}