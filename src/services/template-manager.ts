//
// Managing the inflation and export of templates.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { joinPath } from "../lib/join-path";
import { IConfiguration, IConfiguration_id } from "./configuration";
import { IFs, IFs_id } from "./fs";
import { ILog, ILog_id } from "./log";
import * as inquirer from "inquirer";
import { exportTemplate } from "inflate-template";

export const ITemplateManager_id = "ITemplateManager";

export interface ITemplateManager {
    
    //
    // Exports a template.
    //
    export(projectPath: string): Promise<void>;
}

@InjectableSingleton(ITemplateManager_id)
class TemplateManager implements ITemplateManager {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IFs_id)
    fs!: IFs;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    private constructor() {
    }

    //
    // Exports a template.
    //
    async export(projectPath: string): Promise<void> {
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

        const localTemplatePath = this.configuration.getCreateTemplatePath();
        const templateConfigFilePath = joinPath(localTemplatePath, "template.json");
        const templateConfigExists = await this.fs.exists(templateConfigFilePath);
        if (templateConfigExists) {
            const templateConfig = await this.fs.readJsonFile(templateConfigFilePath);
            if (templateConfig.questions !== undefined) {
                if (!Array.isArray(templateConfig.questions)) {
                    throw new Error(`Expected "questions" field in template config file ${templateConfigFilePath} to be an array of questions in the inquirer format (see https://www.npmjs.com/package/inquirer#question).`)
                }
    
                createQuestions = createQuestions.concat(templateConfig.questions);
            }
        }
    
        this.log.debug("Create questions:");
        this.log.debug(createQuestions);
    
        //
        // Ask questions required by the template.
        //
        const templateData = await inquirer.prompt(createQuestions);
    
        this.log.debug("Template data:");
        this.log.debug(templateData);
    
        //
        // Instantiate template and fill in the blanks from the questions.
        //
        await exportTemplate(localTemplatePath, templateData, projectPath);

        //
        // Create the Doulevo config file.
        //
        const configFilePath = joinPath(projectPath, "doulevo.json");
        const defaultConfig = {
            projectType: this.configuration.getProjectType(),
            localPluginPath: this.configuration.getRelativePluginPath(),
            pluginUrl: this.configuration.getPluginUrl(),
        };
        await this.fs.writeJsonFile(configFilePath, defaultConfig);
    }
}
