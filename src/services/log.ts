//
// Access to Log configuration.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { IConfiguration, IConfiguration_id } from "./configuration";

export const ILog_id = "ILog";

export interface ILog {

    //
    // Verbose logging.
    // Enabled with --verbose command line argument.
    //
    verbose(...args: any[]): void;

    //
    // Debug logging.
    // Enabled with --debug command line argument.
    //
    debug(...args: any[]): void;

    //
    // Information logging.
    //
    info(...args: any[]): void;
}

@InjectableSingleton(ILog_id)
class Log implements ILog {
    
    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    //
    // Set to true to supress all info and verbose input.
    //
    quietMode?: boolean;

    //
    // Set to true to enable verbose logging.
    //
    enableVerbose?: boolean;

    //
    // Set to true to enable debug logging.
    //
    enableDebug?: boolean;

    private constructor() {
        // Private constructor.
    }

    //
    // Verbose logging.
    // Enabled with --verbose command line argument.
    //
    verbose(...args: any[]): void {
        if (this.enableVerbose === undefined) {
            this.enableVerbose = this.configuration.getArg<boolean>("verbose");
        }

        if (this.quietMode === undefined) {
            this.quietMode = this.configuration.getArg<boolean>("quiet");
        }

        if (this.enableVerbose && !this.quietMode) {
            console.log(...args);
        }
    }

    //
    // Debug logging.
    // Enabled with --debug command line argument.
    //
    debug(...args: any[]): void {
        if (this.enableDebug === undefined) {
            this.enableDebug = this.configuration.getArg<boolean>("verbose");
        }

        if (this.quietMode === undefined) {
            this.quietMode = this.configuration.getArg<boolean>("quiet");
        }

        if (this.enableDebug && !this.quietMode) {
            console.log(...args);
        }
    }

    //
    // Information logging.
    //
    info(...args: any[]): void {
        if (this.quietMode === undefined) {
            this.quietMode = this.configuration.getArg<boolean>("quiet");
        }

        if (!this.quietMode) {
            console.log(...args);
        }
    }

}