//
// Access to Configuration configuration.
//

import { InjectableSingleton } from "@codecapers/fusion";
import * as minimist from "minimist";

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
}

@InjectableSingleton(IConfiguration_id)
export class Configuration implements IConfiguration {
    
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

}