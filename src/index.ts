import { registerSingleton } from "@codecapers/fusion";
import { Api } from "./api";
import { Configuration, IConfiguration_id } from "./services/configuration";
import * as minimist from "minimist";
import { ILog_id, Log } from "./services/log";

//
// Main entry point for the Doulevo command line tool.
//
async function main(): Promise<void> {

    //
    // Parse arguments.
    //
    const argv = minimist(process.argv.slice(2));

    //
    // Initalise logging.
    //
    const log = new Log(argv);
    registerSingleton(ILog_id, log); // Register for injection.

    //
    // Initialise arguments and configuration.
    //
    const configuration = new Configuration(argv);
    registerSingleton(IConfiguration_id, configuration); // Register for injection.

    //
    // Run Doulevo.
    //
    const doulevo = new Api();
    await doulevo.invoke();
}

main()
    .catch(err => {
        console.error(`Failed:`);
        console.error(err);
        process.exit(1);
    });