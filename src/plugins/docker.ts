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
import { IGit, IGit_id } from "../services/git";
import { IVariables, IVariables_id } from "../services/variables";
import { IFs, IFs_id } from "../services/fs";
const AsciiTable = require('../lib/ascii-table');

export const IDocker_id = "IDocker"

export interface IDocker {

    //
    // Builds the requested project.
    //
    build(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin): Promise<void>;

    //
    // Builds and publishes the image for the project.
    //
    publish(project: IProject, plugin: IPlugin): Promise<string>;

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
    // Show images for the project.
    //
    ls(project: IProject): Promise<void>;

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
    listProjectImages(project: IProject, mode?: "dev" | "prod"): Promise<any[]>;

    //
    // List any containers running for this project.
    //
    listProjectContainers(project: IProject): Promise<any[]>;

    //
    // Removes an image.
    //
    removeImage(imageId: string): Promise<void>;

    //
    // Ejects configuration for customization.
    //
    eject(project: IProject, plugin: IPlugin): Promise<void>;
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

    @InjectProperty(IGit_id)
    git!: IGit;

    @InjectProperty(IVariables_id)
    variables!: IVariables;

    @InjectProperty(IFs_id)
    fs!: IFs;

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

        let dockerFileContent = await this.generateConfiguration(project, plugin, mode);

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
    // Generates the Docker configuration.
    //
    private async generateConfiguration(project: IProject, plugin: IPlugin, mode: string): Promise<string | string> {

        //TODO: If there's a Dockerfile-{dev|prod} or just a Dockerfile just use that.
        //TODO: Could cache the generated file.
        
        const dockerFileContent = await this.templateManager.expandTemplateFile(project, plugin, project.getData(), `docker/Dockerfile-${mode}`, "docker/Dockerfile");
        if (!dockerFileContent) {
            throw new Error(`Failed to find Docker template file in plugin.`);
        }

        return dockerFileContent;
    }

    //
    // Builds and publishes the image for the project.
    // Returns the imageRef for the published image.
    //
    async publish(project: IProject, plugin: IPlugin): Promise<string> {

        //todo: don't allow a publish when there are working changes!

        const variableSpecs = [
            {
                name: "docker.registry.host",
                message: "Please enter the host name for your container registry: ",
            },
            {
                name: "docker.registry.repository",
                message: "Please enter the repository under the container registry: ",
            },
            {
                type: "input",
                name: "docker.registry.username",
                message: "Please enter the user name for your container registry: ",
            },
            {
                type: "input",
                name: "docker.registry.password",
                message: "Please enter the password for your container registry: ",
            },
        ];

        const variables = await this.variables.loadVariables(variableSpecs, project);

        const version = await this.git.getCommitHash(project.getPath());
        const application = "my-application"; //todo:
        const imageRef = `${variables.docker.registry.host}/${variables.docker.registry.repository}/${application}/${project.getName()}:${version}`;
        const tags = [ imageRef ];

        //
        // Build the image.
        //
        await this.build(project, "prod", tags, plugin);

        //
        // Login to the remote Docker reigstry.
        //
        await this.exec.invoke(
            `echo ${variables.docker.registry.password} | docker login ${variables.docker.registry.host} --username ${variables.docker.registry.username} --password-stdin`
        );

        //
        // Push image to the Docker registry.
        //
        await this.exec.invoke(
            `docker push ${imageRef}`
        );

        return imageRef;
    }

    //
    // Builds and runs the requested project.
    //
    async up(project: IProject, mode: "dev" | "prod", tags: string[], plugin: IPlugin, isDetached: boolean): Promise<void> {

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
                `docker run -d ${sharedVolumes} ${this.getProjectTag(project, mode)}`
            );
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
    // Show images for the project.
    //
    async ls(project: IProject): Promise<void> {
        const images = await this.listProjectImages(project);

        const table = new AsciiTable()
        table
            // .setBorder("", "", "", "")
            .removeBorder()
            .setAlign(0, AsciiTable.LEFT)
            .setAlign(1, AsciiTable.LEFT)
            .setAlign(2, AsciiTable.LEFT)
            .setAlign(3, AsciiTable.LEFT)
            .setAlign(4, AsciiTable.LEFT)
            .setHeadingAlign(AsciiTable.LEFT)
            .setHeading('Image', 'Repository', 'Tag', "Created", "Size");

        for (const image of images) {
            table.addRow(image.ID, image.Repository, image.Tag, image.CreatedSince, image.VirtualSize);
        }
    
        this.log.info(table.toString());
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
            .setAlign(3, AsciiTable.LEFT)
            .setHeadingAlign(AsciiTable.LEFT)
            .setHeading('Container', 'Image', 'Status', "Size");

        for (const container of containers) {
            table.addRow(container.ID, container.Image, container.Status, container.Size);
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
    async listProjectImages(project: IProject, mode?: "dev" | "prod"): Promise<any[]> {
        const images = await this.listImages();
        const matchingImages = images.filter(image => {
            if (image.Repository !== this.getProjectRespository(project)) {
                return false;
            }

            if (mode !== undefined && image.Tag !== mode) {
                return false;
            }

            return true;
        });
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

    //
    // Ejects configuration for customization.
    //
    async eject(project: IProject, plugin: IPlugin): Promise<void> {
        const devDockerFileContent = await this.generateConfiguration(project, plugin, "dev");
        await this.fs.writeFile(joinPath(project.getPath(), "Dockerfile-dev"), devDockerFileContent);
        this.log.info("Wrote Dockerfile-dev");

        const prodDockerFileContent = await this.generateConfiguration(project, plugin, "prod");
        await this.fs.writeFile(joinPath(project.getPath(), "Dockerfile-prod"), prodDockerFileContent);
        this.log.info("Wrote Dockerfile-prod");
    }

} 
