
//
// Interface for a Doulevo command.
//
export interface IDoulevoCommand {

    //
    // Invokes the command.
    //
    invoke(): Promise<void>;
}

//
// Describes a Doulevo command.
//
export interface IDoulevoCommandDesc {

    //
    // The name of the command.
    //
    name: string;

    //
    // The description of the command.
    //
    description: string;

    //
    // Constructor function for the command.
    //
    constructor: Function;
}