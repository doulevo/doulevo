//
// Invoke commands and query their metadata.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { ILog, ILog_id } from "./log";

import { IDoulevoCommand } from "../lib/doulevo-command";
import { commands } from "../commands";


const commandConstructorMap: any = {};
for (const command of commands) {
    commandConstructorMap[command.name] = command.constructor;
}

export const ICommandManager_id = "ICommandManager";


export interface ICommandManager {
    
    //
    // Invoke a named command.
    //
    invokeCommand(cmd: string): Promise<void>;
}

@InjectableSingleton(ICommandManager_id)
class CommandManager implements ICommandManager {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    private constructor() {
    }

    //
    // Invoke a named command.
    //
    async invokeCommand(cmd: string): Promise<void> {
        const Command = commandConstructorMap[cmd];
        if (Command === undefined) {
            throw new Error(`Unexpected command ${cmd}`);
        }
        const command: IDoulevoCommand = new Command();
        await command.invoke();
    }
}
