import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "child_process";
import { exportTemplate } from "inflate-template";
import * as inquirer from "inquirer";
import { ICommand } from "../lib/command";

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

export default class CreateCommand implements ICommand {

    async invoke(argv: any, appData: string): Promise<void> {
    
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
    
        const projectTypeQuestion = {
            type: "list",
            name: "PROJECT_TYPE",
            message: "Choose the type of the project (more choices comming in the future): ", 
            choices: [ //TODO: Get choices from some kind of manifest.
                {
                    name: "Node.js",
                    value: "nodejs",
                },
            ],
        };
    
        let localTemplatePath = argv["local-template"] as string;
        if (localTemplatePath === undefined) {
    
            let templateUrl = argv["template-url"];
            if (templateUrl === undefined) {
                //
                // Get the project type.
                //
                let projectType = argv["project-type"];
                if (!projectType) {
                    //
                    // Ask user for project type.
                    //
                    const templateData = await inquirer.prompt([ projectTypeQuestion ]);
                    projectType = templateData.PROJECT_TYPE;
                }
    
                templateUrl = `https://github.com/doulevo/create-template-${projectType}.git`;
            }
    
            const templateDir = path.basename(templateUrl);
    
            //
            // Download and cache the template for this type of project.
            //
            const cachePath = path.join(appData, "create-templates")
            localTemplatePath = path.join(cachePath, templateDir); 
            const templateExists = await fs.pathExists(localTemplatePath);
            if (!templateExists) {
            
                // Download the template.
                await runCmd(`git clone ${templateUrl} ${localTemplatePath}`);
        
                console.log(`Downloaded template to ${localTemplatePath}.`);
            }
            else {
                console.log(`Template already cached at ${localTemplatePath}.`);
            }
        }
        else {
            console.log(`Loading local template from ${localTemplatePath}.`);
        }
    
        // TODO: Fill out answers already provided on the command line.
        //    --answer=PROJECT_NAME=something etc
    
        let createQuestions = [
            {
                type: "input",
                name: "PROJECT_NAME",
                message: "Please enter the name of your project: ",
                default: "new-project",
            },
            {
                type: "input",
                name: "PROJECT_DESCRIPTION",
                message: "Please enter a description of your project: ",
                default: "A new project",
            },
        ];
    
        const templateConfigFilePath = path.join(localTemplatePath, "template.json");
        const templateConfigExists = await fs.pathExists(templateConfigFilePath);
        if (templateConfigExists) {
            const templateConfig = JSON.parse(await fs.readFile(templateConfigFilePath, "utf8"));
            if (templateConfig.questions !== undefined) {
                if (!Array.isArray(templateConfig.questions)) {
                    throw new Error(`Expected "questions" field in template config file ${templateConfigFilePath} to be an array of questions in the inquirer format (see https://www.npmjs.com/package/inquirer#question).`)
                }
    
                createQuestions = createQuestions.concat(templateConfig.questions);
            }
    }
    
        // console.log("Create questions:");
        // console.log(createQuestions);
    
        //
        // Ask questions required by the template.
        //
        const templateData = await inquirer.prompt(createQuestions);
    
        // console.log("Template data:");
        // console.log(templateData);
    
        //
        // Instantiate template and fill in the blanks from the questions.
        //
        await exportTemplate(localTemplatePath, templateData, projectPath);
    
        console.log(`Created project at ${projectPath}`)
    } 
}
