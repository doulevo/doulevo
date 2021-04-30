import Plugin from "../plugins/docker";

export default async function (argv: any): Promise<void> {

    //TODO: Choose the current build plugin (eg "build/docker") based on project configuration.
    const plugin = new Plugin();
    await plugin.build(argv);

    
    // get the current build plugin
    //      (probably docker)
    //
    //      
    //
    //          if the cached dockerfile is out of date
    //
    //              get the dockerfile generator plugin 
    //              (specific to the project type eg JavaScript, Python, etc)
    //
    //              generate the dockerfile
    //
    //          build the dockerfile
    //
    //          possibly tag the dockerfile as part of the application so it can be identified globally on the PC.
    //
    //
}