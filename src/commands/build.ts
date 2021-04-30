
export default async function (argv: any): Promise<void> {
    
    // get the current build plugin
    //      (probably docker)
    //
    //      if baked in files have changed since last build, or if force is enabled
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