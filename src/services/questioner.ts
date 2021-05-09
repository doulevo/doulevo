//
// Asks interactive questions to the user.
//

import { InjectableSingleton } from "@codecapers/fusion";
import * as inquirer from "inquirer";

export const IQuestioner_id = "IQuestioner";

export interface IQuestioner {

    //
    // Ask interactive questions.
    //
    prompt<T = any>(questions: inquirer.QuestionCollection<T>, initialAnswers?: Partial<T>): Promise<T>;
}

@InjectableSingleton(IQuestioner_id)
export class Questioner implements IQuestioner {
    
    private constructor() {
    }

    //
    // Ask interactive questions.
    //
    async prompt<T = any>(questions: inquirer.QuestionCollection<T>, initialAnswers?: Partial<T>): Promise<T> {
        return await inquirer.prompt(questions);
    }
}