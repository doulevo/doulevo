//
// Access to the currently selected plugin.
//

import { InjectableClass } from "@codecapers/fusion";
import { runInThisContext } from "node:vm";

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
    // Get the local path for the plugin, if specified.
    //
    getLocalPath(): string; 

    //
    // Gets the directories that are shared between the host OS and the container.
    //
    getSharedDirectories(): ISharedDirectory[]; 
}

@InjectableClass()
export class Plugin implements IPlugin {

    //
    // Local path to the plugin.
    //
    private localPath: string;

    //
    // Plugin configuration.
    //
    private configurationFile: any;

    constructor(localPluginPath: string, configurationFile: any) {
        this.localPath = localPluginPath;
        this.configurationFile = configurationFile;
    }

    //
    // Get the local path for the plugin.
    //
    getLocalPath(): string {
        return this.localPath;
    }

    //
    // Gets the directories that are shared between the host OS and the container.
    //
    getSharedDirectories(): ISharedDirectory[] {
        return this.configurationFile.sharedDirectories || [];
    }

}