import { exec } from "child_process";
import * as stream from "stream";

//
// Runs a command.
//
export function runCmd(cmd: string, options?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const proc = exec(cmd, options, (error, stdout, stderr) => {
            if (error) {
                //todo: display output?
                reject(error);
            }
            else {
                resolve();
            }
        });

        if (options.stdin) {
            //
            // https://stackoverflow.com/a/41343999/25868
            //
            var stdinStream = new stream.Readable();
            stdinStream.push(options.stdin);    // Add data to the internal queue for users of the stream to consume
            stdinStream.push(null);             // Signals the end of the stream (EOF)
            stdinStream.pipe(proc.stdin!);
        }
    });
}
