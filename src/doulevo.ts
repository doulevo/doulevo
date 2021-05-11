//
// The Doulevo application.
//

import { ILog, InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IEnvironment, IEnvironment_id } from "./services/environment";
import { ILog_id } from "./services/log";
import { IConfiguration, IConfiguration_id } from "./services/configuration";
import { ICommandManager, ICommandManager_id } from "./services/command-manager";
import { IDetectInterrupt, IDetectInterrupt_id } from "./services/detect-interrupt";
const packageInfo = require("../package.json");

@InjectableClass()
export class Doulevo {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(ICommandManager_id)
    commandManager!: ICommandManager;

    @InjectProperty(IDetectInterrupt_id)
    detectInterrupt!: IDetectInterrupt;

    async invoke(): Promise<void> {
        
        const showInfo = this.configuration.getArg<boolean>("info") || this.configuration.getArg<boolean>("debug");
        if (showInfo) {
            this.configuration.info();
            this.environment.info();
        }

        if (this.configuration.getArg<boolean>("version")) {
            this.log.info(`Doulevo v${packageInfo.version}`);
            return;
        }

        let cmd = this.configuration.getMainCommand();
        if (cmd === undefined) {
            cmd = "help";
        }

        // Consumes the main command, allows the next nested sub command to bubble up and be the new main command.
        this.configuration.consumeMainCommand(); 

        await this.commandManager.invokeCommand(cmd);

        await this.detectInterrupt.close();
    }
}