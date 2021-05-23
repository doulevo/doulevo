//
// Managing the inflation and export of templates.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { joinPath } from "../lib/join-path";
import { IConfiguration, IConfiguration_id } from "./configuration";
import { IFs, IFs_id } from "./fs";
import { ILog, ILog_id } from "./log";
import { exportTemplate } from "inflate-template";
import * as handlebars from "handlebars";
import { IProgressIndicator, IProgressIndicator_id } from "./progress-indicator";
import { IQuestioner, IQuestioner_id } from "./questioner";
import { IProject } from "../lib/project";

export const ITemplateManager_id = "ITemplateManager";

export interface ITemplateManager {
    
    //
    // Exports a template.
    //
    exportTemplate(defaultProjectName: string, projectPath: string): Promise<void>;

    //
    // Expands a template file with fallbacks.
    //
    expandTemplateFile(project: IProject, templateData: any, ...fileNames: string[]): Promise<string | undefined>;
}

@InjectableSingleton(ITemplateManager_id)
class TemplateManager implements ITemplateManager {
    
    @InjectProperty(ILog_id)
    log!: ILog;

    @InjectProperty(IFs_id)
    fs!: IFs;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IProgressIndicator_id)
    progressIndicator!: IProgressIndicator;

    @InjectProperty(IQuestioner_id)
    questioner!: IQuestioner;

    private constructor() {
    }

    //
    // Exports a template.
    //
    async exportTemplate(defaultProjectName: string, projectPath: string): Promise<void> {
        // TODO: Fill out answers already provided on the command line.
        //    --answer=PROJECT_NAME=something etc
    
        let createQuestions = [
            {
                type: "input",
                name: "name",
                message: "Please enter the name of your project: ",
                default: defaultProjectName,
            },
            {
                type: "input",
                name: "description",
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

        let templateData: any;

        const isNonInteractive = this.configuration.getArg<boolean>("non-interactive");
        if (isNonInteractive) {
            //
            // Default questions in non-interactive mode.
            //
            templateData = {};

            for (const question of createQuestions) {

                if (question.default === undefined) {
                    throw new Error(`No default answer to the question "${question.name}, this plugin can't run in non-interactive mode.`);
                }
                
                templateData[question.name] = question.default;
            }
        }
        else {
            //
            // Ask questions required by the template.
            //
            templateData = await this.questioner.prompt(createQuestions);
        }

        this.log.debug("Template data:");
        this.log.debug(templateData);

        this.progressIndicator.start("Creating new project...");
    
        try {
            //
            // Instantiate template and fill in the blanks from the questions.
            //
            await exportTemplate(localTemplatePath, templateData, projectPath);

            const name = templateData.name;
            delete templateData.name;

            const description = templateData.description;
            delete templateData.description;

            //
            // Create the Doulevo config file.
            //
            const configFilePath = joinPath(projectPath, "doulevo.json");
            const defaultConfig = {
                name: name,
                description: description,
                projectType: this.configuration.getProjectType(),
                localPluginPath: this.configuration.getRelativePluginPath(),
                pluginUrl: this.configuration.getPluginUrl(),
                data: templateData,
            };
            await this.fs.writeJsonFile(configFilePath, defaultConfig);

            this.progressIndicator.succeed(`Created project at ${projectPath}`);
        }
        catch (err) {
            this.progressIndicator.fail("Failed to create project.");
            throw err;
        }
    }

    //
    // Expands a template file with fallbacks.
    //
    async expandTemplateFile(project: IProject, templateData: any, ...fileNames: string[]): Promise<string | undefined> {

        const pluginPath = await project.getLocalPluginPath();

        if (!pluginPath) {
            throw new Error(`Failed to determine local plugin path.`);
        }

        for (const fileName of fileNames) {
            const templateFilePath = joinPath(pluginPath, "template-files", fileName);
            if (await this.fs.exists(templateFilePath)) {
                const templateFileContent = await this.fs.readFile(templateFilePath);
                const template = handlebars.compile(templateFileContent);
                //TODO: Should cache the compiled template.
                const expandedContent = template(templateData);
                return expandedContent;
            }
        }

        // Template file was not found in this plugin.
        return undefined;       
    }
}
