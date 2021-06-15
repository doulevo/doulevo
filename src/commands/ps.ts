import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ICommand, ICommandDesc } from "../command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";
import { IKubernetes, IKubernetes_id } from "../plugins/kubernetes";

@InjectableClass()
export class PsCommand implements ICommand {

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

        const env = this.configuration.getArg("env") || "local";
        if (env !== "prod" && env !== "local") {
            throw new Error(`--prod can only be either "prod" or "local".`);
        }

        if (env === "local") {
            //
            // Show local containers.
            //
            await this.docker.ps(project);
        }
        else {
            //
            // Show remote containers.
            //
            await this.kubernetes.ps(project);
        }
    }
}

const command: ICommandDesc = {
    name: "ps",
    constructor: PsCommand,
    help: {
        usage: "doulevo ps [options]",
        description: "Shows containers for the project.",
        options: [
            {
                name: "--project=<path>",
                description: "Sets the path to the project, defaults to the working directory if not specified.",
                defaultValue: "<current directory>",
            },     
            {
                name: "--env={local|prod}",
                description: "Sets the environment from which to show containers.",
                defaultValue: "local",
            },
        ],
    }
};

export default command;
