import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ICommand, ICommandDesc } from "../command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";
import { Plugin } from "../lib/plugin";
import { IKubernetes, IKubernetes_id } from "../plugins/kubernetes";

@InjectableClass()
export class LogsCommand implements ICommand {

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

        const env = this.configuration.getArg("env") || "local";
        if (env !== "prod" && env !== "local") {
            throw new Error(`--prod can only be either "prod" or "local".`);
        }

        const follow = this.configuration.getArg<boolean>("f") || this.configuration.getArg<boolean>("follow") || false;

        if (env === "local") {
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

const command: ICommandDesc = {
    name: "logs",
    constructor: LogsCommand,
    help: {
        usage: "doulevo logs [options]",
        description: "Retrieves logs from containers for the project.",
        options: [
            {
                name: "--project=<path>",
                description: "Sets the path to the project, defaults to the working directory if not specified.",
                defaultValue: "<current directory>",
            },     
            {
                name: "--env={local|prod}",
                description: "Sets the environment from which to retrieve logs.",
                defaultValue: "local",
            },
            {
                name: "--follow, --f",
                description: "Stays attached and follows continuing logs from the project's containers.",
            },
        ],
    }
};

export default command;
