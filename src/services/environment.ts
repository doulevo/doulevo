//
// Access to environment configuration.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { joinPath } from "../lib/join-path";
import { ILog, ILog_id } from "./log";

export const IEnvironment_id = "IEnvironment";

export interface IEnvironment {

    //
    // Display debug info about the environment.
    //
    info(): void;

    //
    // Gets the application's data directory.
    //
    getAppDataDirectory(): string;

}

@InjectableSingleton(IEnvironment_id)
class Environment implements IEnvironment {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    //
    // The data directory for the application.
    //
    private appData: string;

    private constructor() {
        // https://stackoverflow.com/a/26227660/25868
        const APPDATA = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
        this.appData = joinPath(`${APPDATA}/doulevo`);
    }

    //
    // Display info about the environment.
    //
    info(): void {
        this.log.info("HOME: " + process.env.HOME);
        this.log.info("Application data: " + this.appData);
        this.log.info("Platform: " + process.platform);
    }

    //
    // Gets the application's data directory.
    //
    getAppDataDirectory(): string {
        return this.appData;
    }

}
