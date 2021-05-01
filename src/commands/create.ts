import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "child_process";
import { exportTemplate } from "inflate-template";

function runCmd(cmd: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                //todo: display output?
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}

export default async function (argv: any, appData: string): Promise<void> {

    const projectDir = argv._.length > 0 && argv._[0] || undefined;
    if (!projectDir) {
        throw new Error(`Project directory not specified. Use "doulevo create <project-dir>`);
    }

    const projectPath = path.join(process.cwd(), projectDir);
    const projectExists = await fs.pathExists(projectPath);
    if (projectExists) {
        if (argv.force) {
            await fs.remove(projectPath);
        }
        else {
            throw new Error(`Directory already exists at ${projectPath}, please delete the existing directory if you want to create a new project here`);
        }
    }

    // TODO: Get project type from user.
    const projectType = argv.type;
    if (!projectType) {
        throw new Error(`Please set project type with --type=<project-type>, e.g. "nodejs"`);
    }

    const cachePath = path.join(appData, "create-templates")
    const localTemplatePath = path.join(cachePath, `create-template-${projectType}`); 
    const templateExists = await fs.pathExists(localTemplatePath);
    if (!templateExists) {
        // Download the template.
        //TODO: Could also just read the complete template URL from the command line arg. Would allow anyone to use any template.
        const templateUrl = `https://github.com/doulevo/create-template-${projectType}.git`;
        await runCmd(`git clone ${templateUrl} ${localTemplatePath}`);

        console.log(`Downloaded template to ${localTemplatePath}.`);
    }

    // TODO: Ask questions required by template

    // Instantiate template and fill in the blanks from the questions.
    const templateData: any = {};
    await exportTemplate(localTemplatePath, templateData, projectPath);

    console.log(`Created project at ${projectPath}`)
}