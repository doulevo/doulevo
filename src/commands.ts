//
// The collection of all Doulevo commands.
//

import { ICommandDesc } from "./lib/command";
import helpCommand from "./commands/help";
import createCommand from "./commands/create";
import buildCommand from "./commands/build";
import upCommand from "./commands/up";

export const commands: ICommandDesc[] = [
    helpCommand,
    createCommand,
    buildCommand,
    upCommand,
];

