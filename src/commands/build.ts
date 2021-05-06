import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ICommand } from "../lib/command";
import Plugin from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";
import { Project } from "../services/project";

@InjectableClass()
class BuildCommand implements ICommand {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    async invoke(): Promise<void> {

        //
        // The build command operates against the current working directory.
        // Or the path can be set with the --project=<path> argument.
        //
        const projectPath = this.configuration.getArg("project") || this.environment.cwd();

        //
        // Load the project's configuration file.
        //
        const project = await Project.load(projectPath);

        //
        // Do the build.
        //
        // TODO: Choose the current build plugin (eg "build/docker") based on project configuration.
        //
        const plugin = new Plugin();
        await plugin.build(project);
    }
}

export default {
    name: "build",
    description: "Builds the project in the working directory.",
    constructor: BuildCommand,
};