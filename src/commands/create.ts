import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "child_process";
import { exportTemplate } from "inflate-template";
import * as inquirer from "inquirer";

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

    const projectType = argv.type;
    if (!projectType) {
        // TODO: Interactively get project type from user.
        throw new Error(`Please set project type with --type=<project-type>, e.g. "nodejs"`);
    }

    let localTemplatePath = argv["local-template"] as string;
    if (localTemplatePath === undefined) {
        //
        // Download and cache the template for this type of project.
        //
        const cachePath = path.join(appData, "create-templates")
        localTemplatePath = path.join(cachePath, `create-template-${projectType}`); 
        const templateExists = await fs.pathExists(localTemplatePath);
        if (!templateExists) {
            // Download the template.
            const templateUrl = argv["template-url"] || `https://github.com/doulevo/create-template-${projectType}.git`;
            await runCmd(`git clone ${templateUrl} ${localTemplatePath}`);
    
            console.log(`Downloaded template to ${localTemplatePath}.`);
        }
    }
    else {
        console.log(`Loading local template from ${localTemplatePath}.`);
    }

    // TODO: Ask questions required by template

    const templateData = await inquirer.prompt([
        {
            type: "input",
            name: "PROJECT_NAME",
            message: "Please enter the name of your project: ",
        },
        {
            type: "input",
            name: "PROJECT_DESCRIPTION",
            message: "Please enter a description of your project: ",
        },
    ]);    

    console.log("Template data:");
    console.log(templateData);

    //
    // Instantiate template and fill in the blanks from the questions.
    //
    await exportTemplate(localTemplatePath, templateData, projectPath);

    console.log(`Created project at ${projectPath}`)
} 