import Plugin from "../plugins/docker";

export default async function (argv: any): Promise<void> {

    //TODO: Choose the current build plugin (eg "build/docker") based on project configuration.
    const plugin = new Plugin();
    await plugin.down();
}