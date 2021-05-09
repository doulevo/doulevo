//
// Interface to Git.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { IConfiguration, IConfiguration_id } from "./configuration";
import { ILog, ILog_id } from "./log";
import { IRunCmd, IRunCmd_id } from "./run-cmd";

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

    @InjectProperty(IRunCmd_id)
    runCmd!: IRunCmd;

    private constructor() {
    }

    //
    // Clones a Git repo.
    //
    async clone(remoteRepo: string, localPath: string): Promise<void> {
        await this.runCmd.invoke(`git clone ${remoteRepo} ${localPath}`);
    }

    //
    // Create a new repo.
    //
    async createNewRepo(path: string, comment: string): Promise<void> {
        const isDebug = this.configuration.getArg<boolean>("debug") || false;
        await this.runCmd.invoke(`git init`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
        await this.runCmd.invoke(`git add .`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
        await this.runCmd.invoke(`git commit -m "${comment}"`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
    }

}
