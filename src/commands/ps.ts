import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { IDoulevoCommand, IDoulevoCommandDesc } from "../lib/doulevo-command";
import { joinPath } from "../lib/join-path";
import { IDocker, IDocker_id } from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { IFs, IFs_id } from "../services/fs";
import { Project } from "../lib/project";
import { IKubernetes, IKubernetes_id } from "../plugins/kubernetes";

@InjectableClass()
export class PsCommand implements IDoulevoCommand {

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

        const mode = this.configuration.getArg("mode") || "dev";
        if (mode !== "prod" && mode !== "dev") {
            throw new Error(`--mode can only be either "dev" or "prod".`);
        }

        if (mode === "dev") {
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

const command: IDoulevoCommandDesc = {
    name: "ps",
    description: "View containers for the project in the working directory (or the directory specified by --project=<path>).",
    constructor: PsCommand,
    help: {
        usage: "todo",
        message: "todo",
        arguments: [],
    }
};

export default command;
