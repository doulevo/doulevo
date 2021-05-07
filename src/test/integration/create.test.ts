import { registerSingleton } from "@codecapers/fusion";
import { Doulevo } from "../../doulevo";
import { Configuration, IConfiguration_id } from "../../services/configuration";
import * as fs from "fs-extra";
import * as globby from "globby";
import * as path from "path";
import { ILog, ILog_id } from "../../services/log";

describe("create", () => {

    it("can create new project from local path", async ()  => {

        await fs.remove("./test-project");        

        const log: ILog = {
            verbose: () => {},
            debug: () => {},
            info: () => {},        
        };
        registerSingleton(ILog_id, log);

        const argv = {
            _: [ "create", "test-project"],     // Main arguments
            "non-interactive": true,            // Run it in non-interactive mode for the automated tests.
            "quiet": true,                      // Supress output for automated tests.
            "local-plugin": "./test-plugin",    // Use the plugin from a local path.
        };
        const configuration = new Configuration(argv);
        registerSingleton(IConfiguration_id, configuration);

        const doulevo = new Doulevo();
        await doulevo.invoke();

        const files = await globby("**/*", { cwd: "./test-project" });
        const expectedFiles = await globby("**/*", { cwd: "./expected-test-project" });
        expect(files).toEqual(expectedFiles);

        for (const file of expectedFiles) {
            const generatedFile = await fs.readFile(path.join("./test-project", file), "utf8");
            const expectedFile = await fs.readFile(path.join("./expected-test-project", file), "utf8");
            expect(generatedFile).toEqual(expectedFile);
        }
    });

});
