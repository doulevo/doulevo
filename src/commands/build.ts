import { ICommand } from "../lib/command";
import Plugin from "../plugins/docker";

export default class BuildCommand implements ICommand {

    async invoke(argv: any): Promise<void> {
        //TODO: Choose the current build plugin (eg "build/docker") based on project configuration.
        const plugin = new Plugin();
        await plugin.build(argv);
    }
}