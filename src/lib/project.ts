//
// Access to the project configuration.
//

import { InjectableClass } from "@codecapers/fusion";

export interface IProject {
       
    //
    // Gets the project type if specified, or undefined if not.
    // Project type doesn't have to be specified if a template is specified directly by local path or URL.
    //
    getType(): string | undefined;

    //
    // The URL for the plugin, if specified.
    //
    getPluginUrl(): string | undefined;

    //
    // Get the local path for the plugin, if specified.
    //
    getLocalPluginPath(): string | undefined;    

    //
    // Gets the name of the project.
    //
    getName(): string;

    //
    // Gets the path of the project, once set.
    //
    getPath(): string;

    //
    // Gets the data for the project.
    //
    getData(): any;
}

@InjectableClass()
export class Project implements IProject {

    private projectPath: string;

    //
    // Project configuration.
    //
    private configurationFile: any;

    constructor(projectPath: string, configurationFile: any) {
        this.projectPath = projectPath;
        this.configurationFile = configurationFile;
    }

    //
    // Gets the project type if specified, or undefined if not.
    // Project type doesn't have to be specified if a template is specified directly by local path or URL.
    //
    getType(): string | undefined {
        return this.configurationFile.type;
    }

    //
    // The URL for the plugin, if specified.
    //
    getPluginUrl(): string | undefined {
        return this.configurationFile.pluginUrl;
    }

    //
    // Get the local path for the plugin, if specified.
    //
    getLocalPluginPath(): string | undefined {
        return this.configurationFile.localPluginPath;
    }

    //
    // Gets the name of the project.
    //
    getName(): string {
        return this.configurationFile.data.PROJECT_NAME; //todo: Move name to root of config file.
    }

    //
    // Gets the path of the project, once set.
    //
    getPath(): string {
        return this.projectPath;
    }

    //
    // Gets the data for the project.
    //
    getData(): any {
        //todo: expand this with name, etc.
        return this.configurationFile.data;
    }
}