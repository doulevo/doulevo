//
// Access to the project configuration.
//

import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IEnvironment, IEnvironment_id } from "../services/environment";

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

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

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
        let path = this.configurationFile.localPluginPath;
        if (path.startsWith("^")) {
            path = path.replace("^", this.environment.getPluginsDirectory());
        }
        return path;
    }

    //
    // Gets the name of the project.
    //
    getName(): string {
        return this.configurationFile.name;
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
        return Object.assign(
            {}, 
            this.configurationFile.data,
            {
                name: this.configurationFile.name,
                desc: this.configurationFile.description,
            }
        );
    }
}