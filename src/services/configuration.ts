//
// Access to Configuration configuration.
//

import { InjectableClass } from "@codecapers/fusion";
import { joinPath } from "../lib/join-path";

export const IConfiguration_id = "IConfiguration";

export interface IConfiguration {

    
    //
    // Returns true if running in debug mode.
    //
    isDebug(): boolean;

    //
    // Returns true if running in verbose mode.
    //
    isVerbose(): boolean;
       
    //
    // Displays debug info about the configuration.
    //
    info(): void;

    //
    // Get's the main command, or undefined if none.
    //
    getMainCommand(): string | undefined;

    //
    // Consumes the main command.
    // Allows the next nested suncommand to bubble up to become the main command. 
    //
    consumeMainCommand(): void;

    //
    // Get an argument by name.
    //
    getArg<T = string>(argName: string): T | undefined;

    //
    // Get an array of arguments.
    //
    getArrayArg<T = string>(argName: string): T[];

    //
    // Gets the project type if specified, or undefined if not.
    // Project type doesn't have to be specified if a template is specified directly by local path or URL.
    //
    getProjectType(): string | undefined;

    //
    // The URL for the plugin, if specified.
    //
    getPluginUrl(): string | undefined;

    //
    // Get the local path for the plugin, if specified.
    //
    getLocalPluginPath(): string | undefined;    
}

@InjectableClass()
export class Configuration implements IConfiguration {

    private projectType: string | undefined;
    private localPluginPath: string | undefined;
    private pluginUrl: string | undefined;
    
    //
    // Command line arguments to the application.
    //
    private argv: any;

    constructor(argv: any) {
        this.argv = argv;
    }

    //
    // Returns true if running in debug mode.
    //
    isDebug(): boolean {
        return this.getArg<boolean>("debug") || false;
    }

    //
    // Returns true if running in verbose mode.
    //
    isVerbose(): boolean {
        return this.getArg<boolean>("verbose") || this.isDebug();
    }

    //
    // Displays info about the configuration.
    //
    info(): void {
        //
        // NOTE: This can't use the ILog interface because that would create a circular dependency.
        //
        console.log(`Configuration:`);
        console.log(JSON.stringify(this.argv, null, 4));
    }

    //
    // Get's the main argument, or undefined if none.
    //
    getMainCommand(): string | undefined {
        return this.argv._.length > 0 && this.argv._[0] || undefined; 
    }

    //
    // Consumes the main command.
    // Allows the next nested suncommand to bubble up to become the main command. 
    //
    consumeMainCommand(): void {
        // Remove the main command.
        this.argv = Object.assign({}, this.argv, { _: this.argv._.slice(1) }); 
    }

    //
    // Get an argument by name.
    //
    getArg<T>(argName: string): T | undefined {
        return this.argv[argName];
    }

    //
    // Get an array of arguments.
    //
    getArrayArg<T = string>(argName: string): T[] {
        let values: T[];
        const theArg = this.getArg<T | T[]>(argName);
        if (theArg) {
            if (Array.isArray(theArg)) {
                values = theArg;
            }
            else {
                values = [ theArg! ];
            }
        }
        else {
            values = [];
        }
        return values;
    }

    //
    // Gets the project type if specified, or undefined if not.
    // Project type doesn't have to be specified if a template is specified directly by local path or URL.
    //
    getProjectType(): string | undefined {
        if (!this.projectType) {
            this.projectType = this.getArg("project-type");
            if (!this.projectType) {}
        }

        return this.projectType;
    }

    //
    // The URL for the plugin, if specified.
    //
    getPluginUrl(): string | undefined {
        if (!this.pluginUrl) {
            this.pluginUrl = this.getArg("plugin-url");
        }

        return this.pluginUrl;
    }

    //
    // Get the local path for the plugin, if specified.
    //
    getLocalPluginPath(): string | undefined {
        if (!this.localPluginPath) {
            this.localPluginPath = this.getArg("local-plugin");
        }

        return this.localPluginPath;
    }
}