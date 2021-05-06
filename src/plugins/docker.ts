import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import { runCmd } from "../lib/run-cmd";
import { IConfiguration, IConfiguration_id } from "../services/configuration";
import { IPluginManager, IPluginManager_id } from "../services/plugin-manager";
import { ITemplateManager, ITemplateManager_id } from "../services/template-manager";

@InjectableClass()
class DockerPlugin {

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(ITemplateManager_id)
    templateManager!: ITemplateManager;

    async build(): Promise<void> {

        const force = this.configuration.getArg<boolean>("force");
        if (!force) {
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

        let dockerFileContent: string | undefined;

        const docker_file_already_exists = false; // TODO: If there's a Dockerfile-{dev|prod} or just a Dockerfile just use that.
        if (!docker_file_already_exists) {
            // Get previous Dockerfile from local cache.
    
            // If no previous Dockerfile, or it's out of date (eg if configuration has changed that would change the Dockerfile)
                // Out of date if project data has changed.
                // Out of date if plugin hash has changed.
    
                // Look up the Dockerfile generator based on the project type (eg "nodejs", "python", etc).
                const projectData = await this.configuration.getProjectData();
                dockerFileContent = await this.templateManager.expandTemplateFile(projectData, "docker/Dockerfile-dev", "docker/Dockerfile");

                // Generate and cache the Dockerfile.
        }

        // Generate the .dockerignore file (if not existing, or out of date).

        // Input .dockerignore from std input.

        const projectName = await this.configuration.getProjectName();
       
        await runCmd(`docker build . --tag=${projectName}:dev -f -`, { stdin: dockerFileContent });

        // Tag Dockerfile with:
        //      - application? 
        //      - dev/prod
        //      - project GUID
        //      - project name
        //      - content / dockerfile hash
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