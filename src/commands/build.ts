import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ICommand } from "../lib/command";
import Plugin from "../plugins/docker";
import { IConfiguration_id, IConfiguration } from "../services/configuration";
import { IEnvironment, IEnvironment_id } from "../services/environment";

@InjectableClass()
class BuildCommand implements ICommand {

    @InjectProperty(IEnvironment_id)
    environment!: IEnvironment;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    async invoke(): Promise<void> {

        //
        // The build command operates against the current working directory.
        //
        // TODO: Could add a --project-path argument to specify the project directory.
        //
        const projectPath = this.configuration.getArg("project") || this.environment.cwd();
        this.configuration.setProjectPath(projectPath);

        //TODO: Choose the current build plugin (eg "build/docker") based on project configuration.
        const plugin = new Plugin();
        await plugin.build();
    }
}

export default {
    name: "build",
    description: "Builds the project in the working directory.",
    constructor: BuildCommand,
};