//
// Manages the templates for Doulevo.
//

import { InjectableSingleton } from "@codecapers/fusion";
import * as inquirer from "inquirer";
import * as path from "path";
import * as fs from "fs-extra";
import { runCmd } from "./run-cmd";

export const ITemplateManager_id = "ITemplateManager";

export interface ITemplateManager {

    //
    // Gets the local path for a template.
    //
    getTemplateLocalPath(argv: any, appData: string): Promise<string>;
}

@InjectableSingleton(ITemplateManager_id)
class TemplateManager implements ITemplateManager {

    //
    // Gets the local path for a template.
    //
    async getTemplateLocalPath(argv: any, appData: string): Promise<string> {
        let localTemplatePath = argv["local-template"] as string;
        if (localTemplatePath === undefined) {
    
            let templateUrl = argv["template-url"];
            if (templateUrl === undefined) {
                //
                // Get the project type.
                //
                let projectType = argv["project-type"];
                if (!projectType) {
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
        
        return localTemplatePath;
    }
}