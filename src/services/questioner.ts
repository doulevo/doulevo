//
// Asks interactive questions to the user.
//

import { InjectableSingleton, InjectProperty } from "@codecapers/fusion";
import * as inquirer from "inquirer";
import { IConfiguration, IConfiguration_id } from "./configuration";

export const IQuestioner_id = "IQuestioner";

export interface IQuestioner {

    //
    // Ask interactive questions.
    //
    prompt<T = any>(questions: inquirer.QuestionCollection<T>, initialAnswers?: Partial<T>): Promise<T>;
}

@InjectableSingleton(IQuestioner_id)
export class Questioner implements IQuestioner {
    
    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

    private constructor() {
    }

    //
    // Ask interactive questions.
    //
    async prompt<T = any>(questions: inquirer.QuestionCollection<T>, initialAnswers?: Partial<T>): Promise<T> {
        const isNonInteractive = this.configuration.getArg<boolean>("non-interactive");
        if (isNonInteractive) {
            throw new Error(`Running in non-interactive mode, cam't ask questions to the user.`);
        }

        return await inquirer.prompt(questions, initialAnswers);
    }
}