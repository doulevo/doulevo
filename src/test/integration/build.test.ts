import { enableVerbose, instantiateSingleton, registerSingleton } from "@codecapers/fusion";
import { Api } from "../../api";
import { Configuration, IConfiguration_id } from "../../services/configuration";
import { ILog, ILog_id, Log } from "../../services/log";
import { v4 as uuid } from "uuid";
import { Docker, IDocker_id } from "../../plugins/docker";

describe("build", () => {

    it("can build project from local path", async ()  => {

        jest.setTimeout(30000);

        const imageId = uuid();
        const testTagPrefix = "doulevo-test";
        const testTag = `${testTagPrefix}-${imageId}`;

        const argv = {
            _: [ "build" ],                     // Main arguments
            "non-interactive": true,            // Run it in non-interactive mode for the automated tests.
            "quiet": true,                      // Supress output for automated tests.
            "local-plugin": "./test-plugin",    // Use the plugin from a local path.
            "tag": testTag,                     // Add tag so we can id the test Docker image.
            "project": "expected-test-project", // Set the project to build.      
            "debug": false,   // Change to true for more info.     
        };
        registerSingleton(ILog_id, new Log(argv));
        registerSingleton(IConfiguration_id, new Configuration(argv));

        const docker = new Docker();

        //
        // Remove existing test images.
        //
        let images = await docker.listImages();
        let testImages = images.filter((image: any) => image.Repository.startsWith(testTagPrefix));
        for (const testImage of testImages) {
            await docker.removeImage(testImage.ID);
        }

        //
        // Verify that we now have no test images.
        //
        images = await docker.listImages();
        testImages = images.filter((image: any) => image.Repository.startsWith(testTagPrefix));
        expect(testImages.length).toEqual(0);

        //
        // Invoke the Doulevo build command.
        //
        const doulevo = new Api();
        await doulevo.invoke();

        //
        // Check that one test image was created.
        //        
        images = await docker.listImages();
        testImages = images.filter((image: any) => image.Repository === testTag);
        expect(testImages.length).toEqual(1);

        //
        // Remove the test image.
        //
        const { ID: testImageId } = testImages[0];
        await docker.removeImage(testImageId);
    });

});
