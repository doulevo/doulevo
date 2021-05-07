import { exec, ExecOptions } from "child_process";
import * as stream from "stream";

export interface IRunCmdOptions extends ExecOptions {
    //
    // String to be piped to standard input.
    //
    stdin?: string;

    //
    // Set to true to always show output.
    //
    showOutput?: boolean;

    //
    // Set to true to throw an error for a non-zero exit code.
    // Defaults to true.
    ///
    throwOnNonZeroExitCode?: boolean;
}

export interface IRunCmdResult {
    //
    // The exit code from the command.
    //
    exitCode?: number;

    //
    // Standard output from the command.
    //
    stdout: string;

    //
    // Standard error from the command.
    //
    stderr: string;
}

//
// Runs a command.
//
export function runCmd(cmd: string, options?: IRunCmdOptions): Promise<IRunCmdResult> {
    return new Promise<IRunCmdResult>((resolve, reject) => {
        const proc = exec(cmd, options);

        let stdOutput = "";

        proc.stdout!.on('data', (data) => {
            const output = data.toString();
            stdOutput += output;

            if (options?.showOutput) {
                console.log(output);
            }
        });

        let stdError = "";
        
        proc.stderr!.on('data', (data) => {
            const output = data.toString();
            stdError += output;

            if (options?.showOutput) {
                console.log(output);
            }
        });

        proc.on("exit", code => {
            const throwOnNonZeroExitCode = !options || options.throwOnNonZeroExitCode === true || options.throwOnNonZeroExitCode === undefined;
            if (throwOnNonZeroExitCode && code !== 0) {
                const err: any = new Error(`Cmd "${cmd}" exited with error code ${code}`);
                err.code = code;
                err.stdout = stdOutput;
                err.stderr = stdError;
                reject(err);
            }
            else {
                resolve({
                    exitCode: code || undefined,
                    stdout: stdOutput,
                    stderr: stdError,
                });
            }
        });

        if (options && options.stdin) {
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
