import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IDoulevoCommand, IDoulevoCommandDesc } from "../lib/doulevo-command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";
import { Plugin } from "../lib/plugin";
import { IKubernetes, IKubernetes_id } from "../plugins/kubernetes";

@InjectableClass()
export class LogsCommand implements IDoulevoCommand {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IDocker_id)
    docker!: IDocker;

    @InjectProperty(IKubernetes_id)
    kubernetes!: IKubernetes;

    @InjectProperty(IFs_id)
    fs!: IFs;

    async invoke(): Promise<void> {

        //
        // The log command operates against the current working directory.
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

        const follow = this.configuration.getArg<boolean>("f") || this.configuration.getArg<boolean>("follow") || false;

        if (mode === "dev") {
            //
            // Show local logs.
            //
            await this.docker.logs(project, follow);
        }
        else {
            //
            // Show remote logs.
            //
            await this.kubernetes.logs(project);
        }
    }
}

const command: IDoulevoCommandDesc = {
    name: "logs",
    description: "Shows logs from the container for the project in the working directory (or the directory specified by --project=<path>).",
    constructor: LogsCommand,
    help: {
        usage: "todo",
        message: "todo",
        arguments: [],
    }
};

export default command;
