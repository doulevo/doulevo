import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ICommand } from "../lib/command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";

@InjectableClass()
export class BuildCommand implements ICommand {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IDocker_id)
    docker!: IDocker;

    @InjectProperty(IFs_id)
    fs!: IFs;

    async invoke(): Promise<void> {

        //
        // The build command operates against the current working directory.
        // Or the path can be set with the --project=<path> argument.
        //
        const projectPath = this.configuration.getArg("project") || this.environment.cwd();

        //
        // Load the project's configuration file.
        //
        const configurationFilePath = joinPath(projectPath, "doulevo.json");
        const configurationFile = await this.fs.readJsonFile(configurationFilePath);
        const project = new Project(projectPath, configurationFile);

        const mode = this.configuration.getArg("mode") || "dev";
        if (mode !== "prod" && mode !== "dev") {
            throw new Error(`--mode can only be either "dev" or "prod".`);
        }

        //
        // Tags that can identify the image.
        //
        let tags: string[];
        const tagArg = this.configuration.getArg<string | string[]>("tag");
        if (tagArg) {
            if (Array.isArray(tagArg)) {
                tags = tagArg;
            }
            else {
                tags = [ tagArg! ];
            }
        }
        else {
            tags = [];
        }

        //
        // Do the build.
        //
        // TODO: Choose the current build plugin (eg "build/docker") based on project configuration.
        //
        await this.docker.build(project, mode, tags);
    }
}

export default {
    name: "build",
    description: "Builds the project in the working directory.",
    constructor: BuildCommand,
};