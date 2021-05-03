import { exec } from "child_process";

export function runCmd(cmd: string, options?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec(cmd, options, (error, stdout, stderr) => {
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
