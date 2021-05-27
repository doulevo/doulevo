//
// A service for setting, saving and getting project and application variables.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import { IProject } from "../lib/project";
import { IConfiguration, IConfiguration_id } from "./configuration";
import { IFs, IFs_id } from "./fs";
import { IQuestioner, IQuestioner_id } from "./questioner";
import { joinPath } from "../lib/join-path";
import { ILog, ILog_id } from "./log";

export const IVariables_id = "IVariables";

//
// Defines a variable.
//
export interface IVariableSpec {
    //
    // The name of the variable.
    //
    name: string;

    //
    // Message to display to the user when they enter the variable.
    //
    message: string;
}

export interface IVariables {

    //
    // Loads a batch of variables by name.
    // If the variable value already exists in the project it is retreived.
    // Otherwise prompt the user to input the value and then save it in the project.
    // Throws an exception when running in non-interactive mode instead of asking the user.
    // Returns a map of variable values keyed by variable name.
    //
    loadVariables(variableSpecs: IVariableSpec[], project: IProject): Promise<any>;
}

@InjectableSingleton(IVariables_id)
export class Variables implements IVariables {
    
    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    @InjectProperty(IQuestioner_id)
    questioner!: IQuestioner;

    @InjectProperty(IFs_id)
    fs!: IFs;

    @InjectProperty(ILog_id)
    log!: ILog;

    private constructor() {
    }

    //
    // Lookup a nested variable.
    //
    private lookupVariable(variableName: string, variables: any): any {
        const nameParts = variableName.split(".");
        let working = variables;
        for (let i = 0; i < nameParts.length; ++i) {
            working = working[nameParts[i]];
            if (working === undefined) {
                break;
            }
        }

        return working;
    }

    //
    // Set a nested variable.
    //
    private setVariable(variableName: string, variableValue: any, variables: any): void {
        const nameParts = variableName.split(".");
        let working = variables;
        for (let i = 0; i < nameParts.length-1; ++i) {
            const namePart = nameParts[i];
            if (working[namePart] === undefined) {
                working[namePart] = {}
            }
            working = working[namePart];
        }

        working[nameParts[nameParts.length-1]] = variableValue;
    }

    //
    // Loads a batch of variables by name.
    // If the variable value already exists in the project it is retreived.
    // Otherwise prompt the user to input the value and then save it in the project.
    // Throws an exception when running in non-interactive mode instead of asking the user.
    // Returns a map of variable values keyed by variable name.
    //
    async loadVariables(variableSpecs: IVariableSpec[], project: IProject): Promise<any> {

        //  
        //TODO: Instead of being a service this could better be a lazy loaded sub object of Project?
        //
        //TODO: Gather variables from all plugins before doing anything.
        //

        let variables = {};

        const variablesFilePath = joinPath(project.getPath(), ".doulevo/variables.json"); //TODO: This file should be encrypted.
        if (await this.fs.exists(variablesFilePath)) {
            this.log.verbose(`Loading variables from file ${variablesFilePath}.`);
            variables = await this.fs.readJsonFile(variablesFilePath);
        } 
        else {
            this.log.verbose(`Variables file not found: ${variablesFilePath}.`);
        }

        const questions = [];

        for (const variableSpec of variableSpecs) {
            const variableValue = this.lookupVariable(variableSpec.name, variables);
            if (variableValue === undefined) {
                //TODO: Attempt to load the variable from the command line.
                //TODO: Attempt to load the variable from environment.

                questions.push({
                    type: "input",
                    name: variableSpec.name,
                    message: variableSpec.message,
                });
            }
        }

        if (questions.length > 0) {
            //TODO: This check and exception should be moved into the questioner?
            const isNonInteractive = this.configuration.getArg<boolean>("non-interactive");
            if (isNonInteractive) {
                //
                // Need to know some variable values, but can't ask the user in non-interactive mode.
                //
                throw new Error(`Running in non-interactive mode, you need to set the variable by argument --variable=<name>=<value> or environent variable.`);
            }

            const answers = await this.questioner.prompt(questions);
            for (const variableName of Object.keys(answers)) {
                this.setVariable(variableName, answers[variableName], variables);
            }

            //TODO: only save variables that the user entered at the prompt.

            await this.fs.writeJsonFile(variablesFilePath, variables);
        }        

        return variables;
    }
}