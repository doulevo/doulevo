//
// Interface to Kubernetes.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { IConfiguration, IConfiguration_id } from "../services/configuration";
import { IProject } from "../lib/project";
import { ITemplateManager, ITemplateManager_id } from "../services/template-manager";
import { IPlugin } from "../lib/plugin";
import { ILog_id, ILog } from "../services/log";
import { IExec, IExec_id } from "../services/exec";
import { IDetectInterrupt, IDetectInterrupt_id } from "../services/detect-interrupt";
import { IProgressIndicator, IProgressIndicator_id } from "../services/progress-indicator";
import { IDocker, IDocker_id } from "./docker";
import { encodeBase64 } from "../lib/base64";
import { IVariables, IVariables_id, Variables } from "../services/variables";

export const IKubernetes_id = "IKubernetes"

export interface IKubernetes {

    //
    // Deploys the project to the backend.
    //
    deploy(project: IProject, plugin: IPlugin): Promise<void>;
}

@InjectableSingleton(IKubernetes_id)
export class Kubernetes implements IKubernetes {

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(ITemplateManager_id)
    templateManager!: ITemplateManager;

    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IExec_id)
    exec!: IExec;

    @InjectProperty(IDetectInterrupt_id)
    detectInterrupt!: IDetectInterrupt;

    @InjectProperty(IProgressIndicator_id)
    progressIndicator!: IProgressIndicator;

    @InjectProperty(IDocker_id)
    docker!: IDocker;

    @InjectProperty(IVariables_id)
    variables!: IVariables;

    //
    // Deploys the project to the backend.
    //
    async deploy(project: IProject, plugin: IPlugin): Promise<void> {

        let imageRef: string | undefined;

        // Commented these because they make asking questions impossible.
        // TODO: Want to get this back online but would be better to raise events and have progress reporting 
        //       be done at the highest level.
        // this.progressIndicator.start("Publish project...");

        try {
            //
            // Do the build.
            //
            imageRef = await this.docker.publish(project, plugin);

            // this.progressIndicator.succeed("Publish successful.");
        }
        catch (err) {
            // this.progressIndicator.fail("Publish failed.");
            throw err;
        }

        // this.progressIndicator.start("Deploying...");

        const variableSpecs = [
            {
                name: "docker.registry.host",
                message: "Please enter the host name for your container registry: ",
            },
            {
                name: "docker.registry.username",
                message: "Please enter the user name for your container registry: ",
            },
            {
                name: "docker.registry.password",
                message: "Please enter the password for your container registry: ",
            },
        ];

        const variables = await this.variables.loadVariables(variableSpecs, project);
        const encodedAuth = encodeBase64(`${variables.docker.registry.username}:${variables.docker.registry.password}`);

        const auths: any = {};
        auths[variables.docker.registry.host] = {
            auth: encodedAuth,
        };
        const dockerConfig = {
            auths: auths,
        };
        const encodedDockerConfig = encodeBase64(JSON.stringify(dockerConfig));

        try {
            const projectData = project.getData();
            const deploymentData = Object.assign({}, projectData, {
                imageRef: imageRef,

                //
                // Docker authentication.
                //
                // https://dev.to/asizikov/using-github-container-registry-with-kubernetes-38fb
                //
                dockerConfigSecret: encodedDockerConfig,
            });

            //
            // Generate the Kubernetes configuration file.
            //TODO: Might be useful to cache the configuration file in the .doulevo sub-directory.
            //
            const kubernetesFileContent = await this.templateManager.expandTemplateFile(project, deploymentData, `kubernetes/deployment.yaml`);
    
            this.log.verbose("Building with Kubernetes configuration:");
            this.log.verbose(kubernetesFileContent);

            //TODO: Set the Kubectl context to the cluster that the application is linked to.
    
            // 
            // Deploy the service to Kubernetes.
            //
            await this.exec.invoke(`kubectl apply -f -`, {
                stdin: kubernetesFileContent,
            });

            // this.progressIndicator.succeed("Deployed.");
        }
        catch (err) {
            // this.progressIndicator.fail("Deployment failed.");
            throw err;
        }
    }
} 

