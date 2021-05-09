//
// Access to the progress indicator service.
//

import { InjectableSingleton } from "@codecapers/fusion";
import ora = require("ora");

export const IProgressIndicator_id = "IProgressIndicator";

export interface IProgressIndicator {

    //
    // Start the progress indicator.
    //
    start(msg: string): void;

    //
    // Stop the progress indicator and mark it successful.
    //
    succeed(msg: string): void;

    //
    // Stop the progress indicator and mark it failed.
    //
    fail(msg: string): void;

    //
    // Stop the progress indicator and mark it as information.
    //
    info(msg: string): void;

    //
    // Stop the progress indicator and remove it.
    //
    stop(): void;
}

@InjectableSingleton(IProgressIndicator_id)
export class ProgressIndicator implements IProgressIndicator {
    
    private spinner?: ora.Ora;
    
    private constructor() {
    }

    //
    // Start the progress indicator.
    //
    start(msg: string): void {
        if (this.spinner) {
            throw new Error(`Already have a spinner open!`);
        }

        this.spinner = ora(msg).start();
    }

    //
    // Stop the progress indicator and mark it successful.
    //
    succeed(msg: string): void {
        if (!this.spinner) {
            throw new Error(`Spinner not open!`);
        }

        this.spinner.succeed(msg);
        this.spinner = undefined;
    }

    //
    // Stop the progress indicator and mark it failed.
    //
    fail(msg: string): void {
        if (!this.spinner) {
            throw new Error(`Spinner not open!`);
        }

        this.spinner.fail(msg);
        this.spinner = undefined;
    }

    //
    // Stop the progress indicator and mark it as information.
    //
    info(msg: string): void {
        if (!this.spinner) {
            throw new Error(`Spinner not open!`);
        }

        this.spinner.info(msg);
        this.spinner = undefined;
    }

    //
    // Stop the progress indicator and remove it.
    //
    stop(): void {
        if (!this.spinner) {
            throw new Error(`Spinner not open!`);
        }

        this.spinner.stop();
        this.spinner = undefined;
    }

}