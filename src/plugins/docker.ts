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
import { IDetectInterrupt, IDetectInterrupt_id } from "../services/detect-interrupt";
import { IProgressIndicator, IProgressIndicator_id } from "../services/progress-indicator";
import { ICommandResult } from "../lib/command";
const AsciiTable = require('../lib/ascii-table');

export const IDocker_id = "IDocker"

export interface IDocker {

    //
    // Builds the requested project.
    //
    build(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin): Promise<void>;

    //
    // Builds and runs the requested project.
    //
    up(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin, isDetached: boolean): Promise<void>;

    //
    // Stops the container for the current project.
    //
    down(project: IProject, quiet: boolean): Promise<void>;

    //
    // Show logs for the project.
    //
    logs(project: IProject, follow: boolean): Promise<void>;

    //
    // Show containers for the project.
    //
    ps(project: IProject): Promise<void>;

    //
    // List Docker images on the system.
    //
    listImages(): Promise<any[]>;

    //
    // List Docker containers on the system.
    //
    listContainers(): Promise<any[]>;

    //
    // List images for this project.
    //
    listProjectImages(project: IProject, mode: "dev" | "prod"): Promise<any[]>;

    //
    // List any containers running for this project.
    //
    listProjectContainers(project: IProject): Promise<any[]>;

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

    @InjectProperty(IDetectInterrupt_id)
    detectInterrupt!: IDetectInterrupt;

    @InjectProperty(IProgressIndicator_id)
    progressIndicator!: IProgressIndicator;

    //
    // Gets the name of the repository for the project.
    //
    private getProjectRespository(project: IProject): string {
        //todo: Possibly also include application name (or that could be a separate tag).
        //      Or maybe use the projects UUID.
        return project.getName();
    }

    //
    // Gets the tag that can identify the image build for a project.
    //
    private getProjectTag(project: IProject, mode: "dev" | "prod"): string {
        return `${this.getProjectRespository(project)}:${mode}`;
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
        const projectTag = this.getProjectTag(project, mode);
        const projectPath = project.getPath();
        await this.exec.invoke(
            `docker build ${projectPath} --tag=${projectTag} ${tagArgs} -f -`, 
            { 
                stdin: dockerFileContent, 
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
    async up(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin, isDetached: boolean): Promise<void> {

        //
        //  generate the docker command line parameters
        //  up the container (either in detatched or non-detatched mode)
        //
        // just exec 'docker run <application>/<project>'
        //
        // Setup volumes for live reload.
        //

        this.progressIndicator.start("Building...");

        try {
            await Promise.all([
                this.build(project, mode, tags, plugin),
                this.down(project, true)
            ]);
        }
        finally {
            this.progressIndicator.stop();
        }

        let sharedVolumes = "";

        if (mode === "dev") {
            //
            // When running in dev mode, share code into the container.
            //
            const sharedDirectories = plugin.getSharedDirectories();
            this.log.verbose("Sharing directories:");
            this.log.verbose(JSON.stringify(sharedDirectories, null, 4));
    
            const projectPath = path.resolve(project.getPath());
            sharedVolumes = sharedDirectories
                .map(sharedPath => {
                    return `-v ${joinPath(projectPath, sharedPath.host)}:${sharedPath.container}:z`;
                })
                .join(" ");
        }

        this.progressIndicator.start("Starting container...");

        let runResult: ICommandResult;

        try {
            runResult = await this.exec.invoke(
                `docker run -d ${sharedVolumes} ${this.getProjectTag(project, mode)}`);
        }
        finally {
            this.progressIndicator.succeed("Container was started.");
        }

        const containerId = runResult.stdout.trim();
        this.log.info(`Container ID: ${containerId}`);

        if (!isDetached) {
            this.detectInterrupt.pushHandler(async () => {
                this.log.verbose(`Stoppping and removing container ${containerId}.`);
                await this.exec.invoke(`docker stop ${containerId}`);
                await this.exec.invoke(`docker rm ${containerId}`);
                return true;
            });

            try {
                await this.logs(project, true);
            }
            finally {
                this.detectInterrupt.popHandler();
            }
        }       
    }

    //
    // Stops the container for the current project.
    //
    async down(project: IProject, quiet: boolean): Promise<void> {
        const containers = await this.listProjectContainers(project);
        if (containers.length > 0) {
            if (!quiet) {
                this.log.verbose(`Killing containers:`);
                for (const container of containers) {
                    this.log.verbose(`    ${container.ID}`);
                }
            }
              
            this.progressIndicator.start("Stopping containers...");

            try {
                await Promise.all(containers.map(container => this.exec.invoke(`docker stop ${container.ID}`)));
                await Promise.all(containers.map(container => this.exec.invoke(`docker rm ${container.ID}`)));
            }
            finally {
                this.progressIndicator.succeed("Stopped containers.");
            }
        }
        else {
            if (!quiet) {
                this.log.info("Not running.");
            }
        }
    }

    //
    // Show logs for the project.
    //
    async logs(project: IProject, follow: boolean): Promise<void> {
        const containerId = await this.findContainerId(project);
        if (containerId) {
            await this.exec.invoke(`docker logs ${containerId} ${follow ? "--follow" : ""}`, { showOutput: true })
        }
        else {
            this.log.info(`Not running.`);
        }
    }


    //
    // Show containers for the project.
    //
    async ps(project: IProject): Promise<void> {
        const containers = await this.listProjectContainers(project);

        const table = new AsciiTable()
        table
            // .setBorder("", "", "", "")
            .removeBorder()
            .setAlign(0, AsciiTable.LEFT)
            .setAlign(1, AsciiTable.LEFT)
            .setAlign(2, AsciiTable.LEFT)
            .setHeadingAlign(AsciiTable.LEFT)
            .setHeading('Container', 'Image', 'Status');

        for (const container of containers) {
            table.addRow(container.ID, container.Image, container.Status);
        }
    
        this.log.info(table.toString());
    }

    //
    // List Docker images on the system.
    //
    async listImages(): Promise<any[]> {
        const result = await this.exec.invoke(`docker image ls  --format "{{json . }}"`);
        const output = result.stdout; 
        
        // Convert semi-JSON output to proper JSON.
        const formattedJson = `[ ${output.split("\n").map(line => line.trim()).filter(line => line.length > 0).join(", ")} ]`;
        return JSON.parse(formattedJson );
    }

    //
    // List images for this project.
    //
    async listProjectImages(project: IProject, mode: "dev" | "prod"): Promise<any[]> {
        const images = await this.listImages();
        const matchingImages = images.filter(image => image.Repository === this.getProjectRespository(project) && image.Tag === mode);
        return matchingImages;
    }

    //
    // List Docker containers on the system.
    //
    async listContainers(): Promise<any[]> {
        const result = await this.exec.invoke(`docker ps --format "{{json . }}"`);
        const output = result.stdout; 
        
        // Convert semi-JSON output to proper JSON.
        const formattedJson = `[ ${output.split("\n").map(line => line.trim()).filter(line => line.length > 0).join(", ")} ]`;
        return JSON.parse(formattedJson );
    }

    //
    // List any containers running for this project.
    //
    async listProjectContainers(project: IProject): Promise<any[]> {
        const containers = await this.listContainers();
        const matchingContainers = containers.filter(container => container.Image.startsWith(this.getProjectRespository(project)));
        return matchingContainers;
    }

    //
    // Find the container ID for hte project.
    //
    private async findContainerId(project: IProject): Promise<string | undefined> {
        const containers = await this.listProjectContainers(project);
        if (containers.length > 1) {
            throw new Error(`Something went wrong, found ${containers.length} for images ${this.getProjectRespository(project)}`);
        }

        if (containers.length === 1) {
            return containers[0].ID;
        }

        return undefined;
    }

    //
    // Removes an image.
    //
    async removeImage(imageId: string): Promise<void> {
        await this.exec.invoke(`docker image rm ${imageId} --force`);
    }
} 
