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
import { v4 as uuid } from "uuid";
import { decodeBase64, encodeBase64 } from "../lib/base64";

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

    //
    // Deploys the project to the backend.
    //
    async deploy(project: IProject, plugin: IPlugin): Promise<void> {

        let imageRef: string | undefined;

        this.progressIndicator.start("Publish project...");

        try {
            //
            // Do the build.
            //
            imageRef = await this.docker.publish(project, plugin);

            this.progressIndicator.succeed("Publish successful.");
        }
        catch (err) {
            this.progressIndicator.fail("Publish failed.");
            throw err;
        }

        this.progressIndicator.start("Deploying...");

        const dockerUn = "todo";
        const dockerPw = "todo";
        const encodedAuth = encodeBase64(`${dockerUn}:${dockerPw}`);

        const dockerRegistry = "todo";
        const auths: any = {};
        auths[dockerRegistry] = {
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

            this.progressIndicator.succeed("Deployed.");
        }
        catch (err) {
            this.progressIndicator.fail("Deployment failed.");
            throw err;
        }
    }
} 

