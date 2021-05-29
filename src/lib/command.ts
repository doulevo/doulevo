//
// Manages execution of a system command.
//

import { InjectableClass, InjectProperty } from "@codecapers/fusion";
import chalk = require("chalk");
import { exec, ExecOptions } from "child_process";
import * as stream from "stream";
import { IConfiguration, IConfiguration_id } from "../services/configuration";
import { IDetectInterrupt, IDetectInterrupt_id } from "../services/detect-interrupt";

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
    // Prefix to show for each line of output.
    //
    outputPrefix?: string;

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

@InjectableClass()
export class Command implements ICommand {

    @InjectProperty(IDetectInterrupt_id)
    detectInterrupt!: IDetectInterrupt;

    @InjectProperty(IConfiguration_id)
    configuration!: IConfiguration;

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
            if (this.options.showCommand || this.configuration.isDebug()) {
                console.log(`CMD: ${this.cmd}`);
            }

            let didTerminate = false;

            const proc = exec(this.cmd, this.options);

            this.detectInterrupt.pushHandler(async () => {
                proc.kill("SIGINT");
                didTerminate = true;
                return true; // Allow process termination.
            });

            let stdOutput = "";

            const writeOutput = (output: string) => {
                if (this.options.outputPrefix) {
                    const lines = output.split("\n");
                    for (const line of lines) {
                        process.stdout.write(`${this.options.outputPrefix}: ${line.trim()}\n`);
                    }
                }
                else {
                    process.stdout.write(output);
                }
            }

            proc.stdout!.on('data', (data) => {
                const output = data.toString();
                stdOutput += output;

                if (this.options.showOutput || this.configuration.isDebug()) {
                    writeOutput(output);
                }
            });

            let stdError = "";
            
            proc.stderr!.on('data', (data) => {
                const output = data.toString();
                stdError += output;

                if (this.options.showOutput || this.configuration.isDebug()) {
                    writeOutput(output);
                }
            });

            proc.on("exit", code => {
                this.detectInterrupt.popHandler();

                if (this.options.showCommand || this.configuration.isDebug()) {
                    console.log(`CMD finished: ${this.cmd}`);
                }

                const throwOnNonZeroExitCode = !didTerminate && (this.options.throwOnNonZeroExitCode === true || this.options.throwOnNonZeroExitCode === undefined);
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