import { registerSingleton } from "@codecapers/fusion";
import { Doulevo } from "./doulevo";
import { Configuration, IConfiguration_id } from "./services/configuration";
import * as minimist from "minimist";

async function main(): Promise<void> {
    //
    // Initialise argumentsa and configuration.
    //
    const configuration = new Configuration(minimist(process.argv.slice(2)));
    registerSingleton(IConfiguration_id, configuration); // Register for injection.

    //
    // Run Doulevo.
    //
    const doulevo = new Doulevo();
    await doulevo.invoke();
}

main()
    .catch(err => {
        console.error(`Failed:`);
        console.error(err);
        process.exit(1);
    });