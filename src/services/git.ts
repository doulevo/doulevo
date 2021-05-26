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
    // Get the commit hash for the head.
    // 
    getCommitHash(path: string): Promise<string>;

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
    // Get the commit hash for the head.
    // 
    async getCommitHash(path: string): Promise<string> {
        const result = await this.exec.invoke(`git rev-parse HEAD`, { cwd: path });
        return result.stdout.trim();
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
        await this.exec.invoke(`git init`, { cwd: path });
        await this.exec.invoke(`git add .`, { cwd: path });
        await this.exec.invoke(`git commit -m "${comment}"`, { cwd: path });
    }

}
