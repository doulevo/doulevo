//
// The collection of all Doulevo commands.
//

import { IDoulevoCommandDesc } from "./lib/doulevo-command";
import helpCommand from "./commands/help";
import createCommand from "./commands/create";
import buildCommand from "./commands/build";
import upCommand from "./commands/up";

export const commands: IDoulevoCommandDesc[] = [
    helpCommand,
    createCommand,
    buildCommand,
    upCommand,
];

