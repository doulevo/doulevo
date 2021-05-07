//
// Interface to Docker.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { runCmd } from "../lib/run-cmd";
import { IConfiguration, IConfiguration_id } from "../services/configuration";
import { IProject } from "../lib/project";
import { ITemplateManager, ITemplateManager_id } from "../services/template-manager";

export const IDocker_id = "IDocker"

export interface IDocker {

    //
    // Builds a Docker project.
    //
    build(project: IProject, mode: "dev" | "prod", tags?: string[]): Promise<void>;

    //
    // List Docker images on the system.
    //
    listImages(): Promise<any[]>;

    //
    // Removes an image.
    //
    removeImage(imageId: string): Promise<void>;
}

@InjectableSingleton(IDocker_id)
export class Docker implements IDocker {

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(ITemplateManager_id)
    templateManager!: ITemplateManager;

    //
    // Builds a Docker project.
    //
    async build(project: IProject, mode: "dev" | "prod", tags?: string[]): Promise<void> {

        const force = this.configuration.getArg<boolean>("force");
        if (!force) {
            // TODO: Does the Docker image for this project already exist.
            const docker_image_exists = false;
            if (docker_image_exists) {
                const docker_image_needs_update = false; //TODO: compare hash in tag to content/dockerfile hash.
                if (docker_image_needs_update) {
                    // The Docker image exists and the files in it haven't changed, so it doesn't need to be updated.
                    return;
                }
            }
        }

        let dockerFileContent: string | undefined;

        const docker_file_already_exists = false; // TODO: If there's a Dockerfile-{dev|prod} or just a Dockerfile just use that.
        if (!docker_file_already_exists) {
            // Get previous Dockerfile from local cache.
    
            // If no previous Dockerfile, or it's out of date (eg if configuration has changed that would change the Dockerfile)
                // Out of date if project data has changed.
                // Out of date if plugin hash has changed.

                //TODO: Could delegate generation of the Dockerfile to code in the plugin if necessary.
                dockerFileContent = await this.templateManager.expandTemplateFile(project.getData(), `docker/Dockerfile-${mode}`, "docker/Dockerfile");
                if (!dockerFileContent) {
                    throw new Error(`Failed to find Docker template file in plugin.`);
                }

                // Generate and cache the Dockerfile.
        }

        // Generate the .dockerignore file (if not existing, or out of date).

        // Input .dockerignore from std input.

        //TODO: Ultimately need a way to allocation a version number.
        const tagArgs = tags && tags.map(tag => `--tag=${tag}`).join(" ") || "";
        await runCmd(`docker build . --tag=${project.getName()}:${mode} ${tagArgs} -f -`, { stdin: dockerFileContent });


        // Tag Dockerfile with:
        //      - application? 
        //      - dev/prod
        //      - project GUID
        //      - project name
        //      - content / dockerfile hash
    }

    async up(): Promise<void> {
        //
        //  generate the docker command line parameters
        //  up the container (either in detatched or non-detatched mode)
        //
        // just exec 'docker run <application>/<project>'
        //
        // Setup volumes for live reload.
        //
    }

    async down(): Promise<void> {
        // todo
    }

    //
    // List Docker images on the system.
    //
    async listImages(): Promise<any[]> {
        const output = await runCmd(`docker image ls  --format "{{json . }}"`);
        
        // Convert semi-JSON output to proper JSON.
        const formattedJson = `[ ${output.split("\n").map(line => line.trim()).filter(line => line.length > 0).join(", ")} ]`;
        return JSON.parse(formattedJson );
    }

    //
    // Removes an image.
    //
    async removeImage(imageId: string): Promise<void> {
        await runCmd(`docker image rm ${imageId} --force`);
    }
} 
