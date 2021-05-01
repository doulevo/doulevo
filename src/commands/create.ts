import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "child_process";

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

    // TODO: Get project type from user.
    const projectType = argv.type;
    if (!projectType) {
        throw new Error(`Please set project type with --type=<project-type>, e.g. "nodejs".`);
    }

    const cacheDir = path.join(appData, "create-templates")
    const templateDir = path.join(cacheDir, `create-template-${projectType}`); 
    const templateExists = await fs.pathExists(templateDir);
    if (!templateExists) {
        // Download the template.
        //TODO: Could also just read the complete template URL from the command line arg. Would allow anyone to use any template.
        const templateUrl = `https://github.com/doulevo/create-template-${projectType}.git`;
        await runCmd(`git clone ${templateUrl} ${templateDir}`);

        console.log(`Downloaded template to ${templateDir}.`); //fio:
    }

    // TODO: Ask questions required by template

    // Instantiate template and fill in the blanks from the questions.
}