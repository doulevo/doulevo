//
// Interface to Git.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { runCmd } from "../lib/run-cmd";
import { IConfiguration, IConfiguration_id } from "./configuration";
import { ILog, ILog_id } from "./log";

export const IGit_id = "IGit";

export interface IGit {

    //
    // Clones a Git repo.
    //
    clone(remoteRepo: string, localPath: string): Promise<void>;

    //
    // Create a new repo.
    //
    createNewRepo(path: string, comment: string): Promise<void>;
}

@InjectableSingleton(IGit_id)
class Git implements IGit {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    private constructor() {
    }

    //
    // Clones a Git repo.
    //
    async clone(remoteRepo: string, localPath: string): Promise<void> {
        await runCmd(`git clone ${remoteRepo} ${localPath}`);
    }

    //
    // Create a new repo.
    //
    async createNewRepo(path: string, comment: string): Promise<void> {
        const isDebug = this.configuration.getArg<boolean>("debug") || false;
        await runCmd(`git init`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
        await runCmd(`git add .`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
        await runCmd(`git commit -m "${comment}"`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
    }

}
