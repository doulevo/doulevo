//
// Interface to Docker.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { IConfiguration, IConfiguration_id } from "../services/configuration";
import { IProject } from "../lib/project";
import { ITemplateManager, ITemplateManager_id } from "../services/template-manager";
import { joinPath } from "../lib/join-path";
import * as path from "path";
import { IPlugin } from "../lib/plugin";
import { ILog_id, ILog } from "../services/log";
import { IExec, IExec_id } from "../services/exec";

export const IDocker_id = "IDocker"

export interface IDocker {

    //
    // Builds the requested project.
    //
    build(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin): Promise<void>;

    //
    // Builds and runs the requested project.
    //
    up(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin): Promise<void>;

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

    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IExec_id)
    exec!: IExec;

    //
    // Gets the tag that can identify the image build for a project.
    //
    private getProjectTag(project: IProject): string {
        //todo: Possibly also include application name (or that could be a separate tag).
        //      Or maybe use the projects UUID.
        return project.getName();
    }

    //
    // Builds the requested project.
    //
    async build(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin): Promise<void> {

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

        this.log.verbose("Building with Dockerfile:");
        this.log.verbose(dockerFileContent);

        //TODO: Ultimately need a way to allocation a version number.
        const tagArgs = tags.map(tag => `--tag=${tag}`).join(" ") || "";
        const projectTag = this.getProjectTag(project);
        const projectPath = project.getPath();
        const isDebug = this.configuration.getArg<boolean>("debug") || false;
        await this.exec.invoke(
            `docker build ${projectPath} --tag=${projectTag}:${mode} ${tagArgs} -f -`, 
            { 
                stdin: dockerFileContent, 
                showCommand: isDebug,
                showOutput: isDebug,
            }
        );

        // Tag Dockerfile with:
        //      - application? 
        //      - dev/prod
        //      - project GUID
        //      - project name
        //      - content / dockerfile hash
        //      - tag it with "local" if not build in an official CD system.
    }

    //
    // Builds and runs the requested project.
    //
    async up(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin): Promise<void> {

        //
        //  generate the docker command line parameters
        //  up the container (either in detatched or non-detatched mode)
        //
        // just exec 'docker run <application>/<project>'
        //
        // Setup volumes for live reload.
        //

        await this.build(project, mode, tags, plugin);

        //TODO: Support detached mode.

        //TODO: Share the npm cache directory.

        const sharedDirectories = plugin.getSharedDirectories(); //todo: dev only
        this.log.verbose("Sharing directories:");
        this.log.verbose(JSON.stringify(sharedDirectories, null, 4));

        const projectPath = path.resolve(project.getPath());
        const sharedVolumes = sharedDirectories
            .map(sharedPath => {
                return `-v ${joinPath(projectPath, sharedPath.host)}:${sharedPath.container}:z`;
            })
            .join(" ");

        

        const isDebug = this.configuration.getArg<boolean>("debug") || false;
        await this.exec.invoke(
            `docker run ${sharedVolumes} ${this.getProjectTag(project)}:${mode}`, 
            { 
                showCommand: isDebug,
                showOutput: true,
            }
        );

        //todo: kill/remove the container on ctrl c. when runnning in attached mode.
    }

    async down(): Promise<void> {
        // todo:
    }

    //
    // List Docker images on the system.
    //
    async listImages(): Promise<any[]> {
        const result = await this.exec.invoke(`docker image ls  --format "{{json . }}"`, { showOutput: this.configuration.getArg("debug") });
        const output = result.stdout; 
        
        // Convert semi-JSON output to proper JSON.
        const formattedJson = `[ ${output.split("\n").map(line => line.trim()).filter(line => line.length > 0).join(", ")} ]`;
        return JSON.parse(formattedJson );
    }

    //
    // Removes an image.
    //
    async removeImage(imageId: string): Promise<void> {
        await this.exec.invoke(`docker image rm ${imageId} --force`);
    }
} 
