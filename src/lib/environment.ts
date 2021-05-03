//
// Access to environment configuration.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import * as path from "path";

export const IEnvironment_id = "IEnvironment";

export interface IEnvironment {

    //
    // Gets the application's data directory.
    //
    getAppDataDirectory(): string;

}

@InjectableSingleton(IEnvironment_id)
class Environment implements IEnvironment {
    
    //
    // The data directory for the application.
    //
    private appData: string;

    constructor() {
        // https://stackoverflow.com/a/26227660/25868
        const APPDATA = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");

        // console.log("HOME: " + process.env.HOME);
        // console.log("APPDATA: " + appData);
        // console.log("Platform: " + process.platform);

        this.appData = path.join(`${APPDATA}/doulevo`);
    }

    //
    // Gets the application's data directory.
    //
    getAppDataDirectory(): string {
        return this.appData;
    }

}