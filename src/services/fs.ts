//
// Access to the file system.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { ILog, ILog_id } from "./log";
import * as fs from "fs-extra";

export const IFs_id = "IFs";

export interface IFs {

    //
    // Checks if a file or directory exists.
    //
    exists(path: string): Promise<boolean>;   
    
    //
    // Removes a file or directory.
    //
    remove(path: string): Promise<void>;

    //
    // Reads a file from disk.
    //
    readFile(path: string): Promise<string>;

    //
    // Writes a file to disk.
    //
    writeFile(path: string, data: string): Promise<void>;

    //
    // Reads a JSON file from disk.
    //
    readJsonFile<T = any>(path: string): Promise<T>;

    //
    // Writes a JSON file to disk.
    //
    writeJsonFile<T = any>(path: string, data: T): Promise<void>;
}

@InjectableSingleton(IFs_id)
class Fs implements IFs {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    private constructor() {
    }

    //
    // Checks if a file or directory exists.
    //
    async exists(path: string): Promise<boolean> {
        return await fs.pathExists(path);
    }

    //
    // Removes a file or directory.
    //
    async remove(path: string): Promise<void> {
        await fs.remove(path);
    }

    //
    // Reads a file from disk.
    //
    async readFile(path: string): Promise<string> {
        return await fs.readFile(path, "utf8");
    }

    //
    // Writes a file to disk.
    //
    async writeFile(path: string, data: string): Promise<void> {
        await fs.writeFile(path, data);
    }

    //
    // Reads a JSON file from disk.
    //
    async readJsonFile<T = any>(path: string): Promise<T> {
        return JSON.parse(await this.readFile(path));
    }

    //
    // Writes a JSON file to disk.
    //
    async writeJsonFile<T = any>(path: string, data: T): Promise<void> {
        await this.writeFile(path, JSON.stringify(data, null, 4));   
    }

}
