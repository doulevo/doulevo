//
// Asks interactive questions to the user.
//

import { InjectableSingleton } from "@codecapers/fusion";
import { Command, ICommandOptions, ICommandResult } from "../lib/command";

export const IExec_id = "IExec";

export interface IExec {
    //
    // Executes a command.
    //
    invoke(cmd: string, options?: ICommandOptions): Promise<ICommandResult>;
}

@InjectableSingleton(IExec_id)
export class Exec implements IExec {

   
    private constructor() {
    }

    //
    // Executes a command.
    //
    async invoke(cmd: string, options?: ICommandOptions): Promise<ICommandResult> {
        const command = new Command(cmd, options);
        return await command.exec(); 
    }
}