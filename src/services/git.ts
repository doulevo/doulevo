//
// Interface to Git.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { joinPath } from "../lib/join-path";
import { runCmd } from "../lib/run-cmd";
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
        await runCmd(`git init`, { cwd: path });
        await runCmd(`git add .`, { cwd: path });
        await runCmd(`git commit -m "${comment}"`, { cwd: path });
    }

}
