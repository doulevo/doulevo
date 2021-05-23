
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
// Describes the help output for a particular command.
//
export interface IDoulevoCommandHelp {
    // 
    // Shows how to use the command.
    // 
    usage: string;

    //
    // Describes what the command does.
    //
    message: string;

    //
    // Describe the arguments for the command.
    //
    arguments: [string, string][];
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

    //
    // Defines the --help option output for the command.
    //
    help: IDoulevoCommandHelp;
}