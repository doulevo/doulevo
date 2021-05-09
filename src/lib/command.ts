//
// Manages execution of a system command.
//

import { exec, ExecOptions } from "child_process";
import * as stream from "stream";

export interface ICommandOptions extends ExecOptions {

    //
    // Set to true to print the command.
    //
    showCommand?: boolean;

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

export interface ICommandResult {
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

export interface ICommand {
    //
    // Executes the command.
    //
    exec(): Promise<ICommandResult>;
}

export class Command implements ICommand {

    //
    // The command to execute.
    //
    cmd: string;

    //
    // Options to the command.
    //
    options: ICommandOptions;

    constructor(cmd: string, options?: ICommandOptions) {
        this.cmd = cmd;
        this.options = options || {};
    }

    //
    // Executes the command.
    //
    exec(): Promise<ICommandResult> {
        return new Promise<ICommandResult>((resolve, reject) => {
            if (this.options.showCommand) {
                console.log(`CMD: ${this.cmd}`);
            }

            const proc = exec(this.cmd, this.options);

            let stdOutput = "";

            proc.stdout!.on('data', (data) => {
                const output = data.toString();
                stdOutput += output;

                if (this.options.showOutput) {
                    console.log(output);
                }
            });

            let stdError = "";
            
            proc.stderr!.on('data', (data) => {
                const output = data.toString();
                stdError += output;

                if (this.options.showOutput) {
                    console.log(output);
                }
            });

            proc.on("exit", code => {
                const throwOnNonZeroExitCode = this.options.throwOnNonZeroExitCode === true || this.options.throwOnNonZeroExitCode === undefined;
                if (throwOnNonZeroExitCode && code !== 0) {
                    const err: any = new Error(`Cmd "${this.cmd}" exited with error code ${code}`);
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

            if (this.options.stdin) {
                //
                // https://stackoverflow.com/a/41343999/25868
                //
                var stdinStream = new stream.Readable();
                stdinStream.push(this.options.stdin);    // Add data to the internal queue for users of the stream to consume
                stdinStream.push(null);             // Signals the end of the stream (EOF)
                stdinStream.pipe(proc.stdin!);
            }
        });
    }
}