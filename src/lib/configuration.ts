//
// Access to Configuration configuration.
//

import { InjectableSingleton } from "@codecapers/fusion";
import * as minimist from "minimist";
import * as inquirer from "inquirer";
import * as path from "path";

export const IConfiguration_id = "IConfiguration";

export interface IConfiguration {
    
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
    // Gets the project type if specified, or undefined if not.
    // Project type doesn't have to be specified if a template is specified directly by local path or URL.
    //
    getProjectType(): string | undefined;

    //
    // Requests the project type from the user if it's not already set in the configuration.
    //
    requestProjectType(): Promise<string>;
    
    //
    // The URL for the plugin, if specified.
    //
    getPluginUrl(): string | undefined;

    //
    // Set the URL for the plugin.
    //
    setPluginUrl(pluginUrl: string): void;

    //
    // Get the local path for the plugin, if specified.
    //
    getLocalPluginPath(): string | undefined;    

    //
    // Sets the local path to the plugin.
    //
    setLocalPluginPath(localPluginPath: string): void;

    //
    // Gets the local path for the "create" template.
    //
    getCreateTemplatePath(): string;
}

@InjectableSingleton(IConfiguration_id)
export class Configuration implements IConfiguration {

    private projectType: string | undefined;
    private localPluginPath: string | undefined;
    private pluginUrl: string | undefined;
    
    //
    // Command line arguments to the application.
    //
    private argv: any;

    private constructor() {
        const argv = minimist(process.argv.slice(2));
        this.argv = argv;
    }

    //
    // Displays info about the configuration.
    //
    info(): void {
        //
        // NOTE: This can't use the ILog interface because that would create a circular dependency.
        //
        console.log(`Doulevo configuration:`);
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
    // Requests the project type from the user if it's not already set in the configuration.
    //
    async requestProjectType(): Promise<string> {
        if (!this.getProjectType()) {
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
            this.projectType = answers.PROJECT_TYPE;
        }

        return this.projectType!;
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
    // Set the URL for the plugin.
    //
    setPluginUrl(pluginUrl: string): void {
        this.pluginUrl = pluginUrl;
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

    //
    // Sets the local path to the plugin.
    //
    setLocalPluginPath(localPluginPath: string): void {
        this.localPluginPath = localPluginPath;
    }

    //
    // Gets the local path for the "create" template.
    //
    getCreateTemplatePath(): string {
        const localPluginPath = this.getLocalPluginPath();
        if (!localPluginPath) {
            throw Error(`Failed to determine local plugin path!`);
        }

        return path.join(localPluginPath, "create-template");
    }
}