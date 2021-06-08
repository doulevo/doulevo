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
import { IVariables, IVariables_id } from "../services/variables";
import { joinPath } from "../lib/join-path";
import { IFs, IFs_id } from "../services/fs";
const AsciiTable = require('../lib/ascii-table');

export const IKubernetes_id = "IKubernetes"

export interface IKubernetes {

    //
    // Deploys the project to the backend.
    //
    deploy(project: IProject, plugin: IPlugin): Promise<void>;

    //
    // Print logs from the backend.
    //
    logs(project: IProject): Promise<void>;

    //
    // Print containers running in Kubernetes.
    //
    ps(project: IProject): Promise<void>;

    //
    // Ejects configuration for customization.
    //
    eject(project: IProject, plugin: IPlugin): Promise<void>;
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

    @InjectProperty(IFs_id)
    fs!: IFs;

    //
    // Deploys the project to the backend.
    //
    async deploy(project: IProject, plugin: IPlugin): Promise<void> {

        let imageRef: string | undefined;

        //
        // Do the build.
        //
        imageRef = await this.docker.publish(project, plugin);

        const variableSpecs = [
            {
                name: "docker.registry.host",
                message: "Container registry / host name: ",
            },
            {
                name: "docker.registry.username",
                message: "Container registry / user name: ",
                isSensitive: true,
            },
            {
                name: "docker.registry.password",
                message: "Container registry / password: ",
                isSensitive: true,
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

        this.progressIndicator.start("Deploying container...");

        try {
            const kubernetesFileContent = await this.generateConfiguration(project, plugin, imageRef, encodedDockerConfig);
    
            this.log.verbose("Building with Kubernetes configuration:");
            this.log.verbose(kubernetesFileContent);
    
            //TODO: Set the Kubectl context to the cluster that the application is linked to.
    
            // 
            // Deploy the service to Kubernetes.
            //
            await this.exec.invoke(`kubectl apply -f -`, {
                stdin: kubernetesFileContent,
            });

            this.progressIndicator.succeed("Deployed container.");
        }
        catch (err) {
            this.progressIndicator.fail("Failed to deploy container.");
            throw err;
        }

    }

    //
    // Generate Kubernetes configuration file.
    //
    private async generateConfiguration(project: IProject, plugin: IPlugin, imageRef: string, encodedDockerConfig: string): Promise<string> {
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
        const kubernetesFileContent = await this.templateManager.expandTemplateFile(project, plugin, deploymentData, `kubernetes/deployment.yaml`);
        if (!kubernetesFileContent) {
            throw new Error(`Failed to find Kubernetes template file in plugin.`);
        }
        return kubernetesFileContent;
    }

    //
    // Print logs from the backend.
    //
    async logs(project: IProject): Promise<void> {

        const pods = await this.getPods(project);
        const podNames = pods.map(pod => pod.metadata.name);
        await Promise.all(podNames.map(async podName => {
            await this.exec.invoke(`kubectl logs ${podName}`, {
                showOutput: true,
                outputPrefix: podName,
            });
        }));
    }

    //
    // Print containers running in Kubernetes.
    //
    async ps(project: IProject): Promise<void> {
        const pods = await this.getPods(project);

        const table = new AsciiTable()
        table
            // .setBorder("", "", "", "")
            .removeBorder()
            .setAlign(0, AsciiTable.LEFT)
            .setAlign(1, AsciiTable.LEFT)
            .setAlign(2, AsciiTable.LEFT)
            .setHeadingAlign(AsciiTable.LEFT)
            .setHeading('Pod', 'Status', 'Created');

        for (const pod of pods) {
            table.addRow(pod.metadata.name, pod.status.phase, pod.metadata.creationTimestamp);
        }
    
        this.log.info(table.toString());

    }

    //
    // Get the pods running for this project.
    //
    private async getPods(project: IProject): Promise<any[]> {
        const result = await this.exec.invoke(`kubectl get pods -l=app=${project.getName()} -o json`);
        return JSON.parse(result.stdout).items;
    }

    //
    // Ejects configuration for customization.
    //
    async eject(project: IProject, plugin: IPlugin): Promise<void> {
        const kubernetesFileContent = await this.generateConfiguration(project, plugin, "{{imageRef}}", "{{dockerAuth}}");
        await this.fs.writeFile(joinPath(project.getPath(), "Deployment.yaml"), kubernetesFileContent);
        this.log.info("Wrote Deployment.yaml");
    }
} 

