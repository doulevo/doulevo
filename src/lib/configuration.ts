//
// Access to Configuration configuration.
//

import { InjectableClass } from "@codecapers/fusion";

export const IConfiguration_id = "IConfiguration";

export interface IConfiguration {

    //
    // Get's the main argument, or undefined if none.
    //
    getMainArg(): string | undefined;

    //
    // Get an argument by name.
    //
    getArg<T = string>(argName: string): T | undefined;
}

@InjectableClass()
export class Configuration implements IConfiguration {
    
    //
    // Command line arguments to the application.
    //
    private argv: any;

    constructor(argv: any) {
        this.argv = argv;
    }

    //
    // Get's the main argument, or undefined if none.
    //
    getMainArg(): string | undefined {
        return this.argv._.length > 0 && this.argv._[0] || undefined; 
    }

    //
    // Get an argument by name.
    //
    getArg<T>(argName: string): T | undefined {
        return this.argv[argName];
    }

}