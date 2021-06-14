//
// The collection of all Doulevo commands.
//

import { IDoulevoCommandDesc } from "./lib/doulevo-command";
import createCommand from "./commands/create";
import buildCommand from "./commands/build";
import upCommand from "./commands/up";
import downCommand from "./commands/down";
import logsCommand from "./commands/logs";
import psCommand from "./commands/ps";
import lsCommand from "./commands/ls";
import deployCommand from "./commands/deploy";
import ejectCommand from "./commands/eject";
import publishCommand from "./commands/publish";

export const commands: IDoulevoCommandDesc[] = [
    createCommand,
    buildCommand,
    upCommand,
    downCommand,
    logsCommand,
    psCommand,
    lsCommand,
    deployCommand,
    ejectCommand,
    publishCommand,
];

