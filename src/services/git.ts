//
// Interface to Git.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { IConfiguration, IConfiguration_id } from "./configuration";
import { ILog, ILog_id } from "./log";
import { IExec, IExec_id } from "./exec";

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

    @InjectProperty(IExec_id)
    exec!: IExec;

    private constructor() {
    }

    //
    // Clones a Git repo.
    //
    async clone(remoteRepo: string, localPath: string): Promise<void> {
        await this.exec.invoke(`git clone ${remoteRepo} ${localPath}`);
    }

    //
    // Create a new repo.
    //
    async createNewRepo(path: string, comment: string): Promise<void> {
        const isDebug = this.configuration.getArg<boolean>("debug") || false;
        await this.exec.invoke(`git init`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
        await this.exec.invoke(`git add .`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
        await this.exec.invoke(`git commit -m "${comment}"`, { cwd: path, showCommand: isDebug, showOutput: isDebug });
    }

}
