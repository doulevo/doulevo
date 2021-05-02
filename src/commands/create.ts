import * as path from "path";
import * as fs from "fs-extra";
import { exportTemplate } from "inflate-template";
import { ICommand } from "../lib/command";
import { ITemplateManager, ITemplateManager_id } from "../lib/template-manager";
import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import * as inquirer from "inquirer";

@InjectableClass()
export default class CreateCommand implements ICommand {

    @InjectProperty(ITemplateManager_id)
    templateManager!: ITemplateManager;

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
    
        const localTemplatePath = await this.templateManager.getTemplateLocalPath(argv, appData);
    
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
