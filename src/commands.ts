//
// The collection of all Doulevo commands.
//

import { IDoulevoCommandDesc } from "./lib/doulevo-command";
import helpCommand from "./commands/help";
import createCommand from "./commands/create";
import buildCommand from "./commands/build";
import upCommand from "./commands/up";
import downCommand from "./commands/down";
import logsCommand from "./commands/logs";
import psCommand from "./commands/ps";

export const commands: IDoulevoCommandDesc[] = [
    helpCommand,
    createCommand,
    buildCommand,
    upCommand,
    downCommand,
    logsCommand,
    psCommand,
];

