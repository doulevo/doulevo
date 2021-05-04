
//
// Interface for a command.
//
export interface ICommand {

    //
    // Invokes the command.
    //
    invoke(): Promise<void>;
}

//
// Describes a command.
//
export interface ICommandDesc {

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