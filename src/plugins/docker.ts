import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { ITemplateManager, ITemplateManager_id } from "../lib/template-manager";

@InjectableClass()
class DockerPlugin {

    async build(argv: any): Promise<void> {

        if (!argv.force) {
            // TODO: Does the Docker image for this project already exist.
            const docker_image_exists = false;
            if (docker_image_exists) {
                const docker_image_needs_update = false; 
                if (docker_image_needs_update) {
                    // The Docker image exists and the files in it haven't changed, so it doesn't need to be updated.
                    return;
                }
            }
        }

        const docker_file_already_exists = false; // TODO: If there's a Dockerfile-{dev|prod} or just a Dockerfile just use that.
        if (!docker_file_already_exists) {
            // Get previous Dockerfile from local cache.
    
            // If no previous Dockerfile, or it's out of date (eg if configuration has changed that would change the Dockerfile)
    
                // Look up the Dockerfile generator based on the project type (eg "nodejs", "python", etc).
                
                //tod: get docker file template from plugin!

                // Generate and cache the Dockerfile.
                
                // Pass in dev/prod.
        }

        // Generate the .dockerignore file (if not existing, or out of date).

        // Build the Dockerfile.
        //
        // exec 'docker build <applicaiton>/<project>'
        // Input Dockerfile and .dockerignore from std input.

        // Tag the Dockerfile so it can be identified as part of this project (the project needs a GUID).

        // Tag the Dockerfile with the hash of the content.
    }

    async up(): Promise<void> {
        //
        //  generate the docker command line parameters
        //  up the container (either in detatched or non-detatched mode)
        //
        // just exec 'docker run <application>/<project>'
    }

    async down(): Promise<void> {
        // todo
    }
} 

export default DockerPlugin;