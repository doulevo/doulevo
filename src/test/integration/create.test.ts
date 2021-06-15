import { registerSingleton } from "@codecapers/fusion";
import { Api } from "../../api";
import { Configuration, IConfiguration_id } from "../../services/configuration";
import * as fs from "fs-extra";
import * as globby from "globby";
import * as path from "path";
import { ILog, ILog_id, Log } from "../../services/log";

describe("create", () => {

    it("can create new project from local path", async ()  => {

        await fs.remove("./test-project");        

        const argv = {
            _: [ "create", "test-project"],     // Main arguments
            "non-interactive": true,            // Run it in non-interactive mode for the automated tests.
            "quiet": true,                      // Supress output for automated tests.
            "local-plugin": "./test-plugin",    // Use the plugin from a local path.
            "debug": false,  // Set to true for more info.
        };
        registerSingleton(ILog_id, new Log(argv));
        registerSingleton(IConfiguration_id, new Configuration(argv));

        const doulevo = new Api();
        await doulevo.invoke();

        const files = await globby("**/*", { cwd: "./test-project" });
        const expectedFiles = await globby("**/*", { cwd: "./expected-test-project" });
        expect(files).toEqual(expectedFiles);

        for (const file of expectedFiles) {
            const generatedFile = await fs.readFile(path.join("./test-project", file), "utf8");
            const expectedFile = await fs.readFile(path.join("./expected-test-project", file), "utf8");
            if (generatedFile !== expectedFile) {
                throw new Error(
                    `Content of file "${file}" is different in "test-project" to "expected-test-project".\n` +
                    `Generated file:\n` +
                    `${generatedFile}\n` +
                    `Expected file:\n` +
                    `${expectedFile}`
                );
            }
        }
    });

});
