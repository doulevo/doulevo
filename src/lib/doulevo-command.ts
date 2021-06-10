
//
// Interface for a Doulevo command.
//
export interface IDoulevoCommand {

    //
    // Invokes the command.
    //
    invoke(): Promise<void>;
}

export interface IOptionHelp {
    //
    // The name of the options.
    //
    name: string;

    //
    // Describes the option.
    //
    message: string;

    //
    // The default value for the option.
    //
    defaultValue?: string;
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
    // Sub commands.
    //
    subCommands?: IDoulevoCommandDesc[];
    
    //
    // Describes the options for the command.
    //
    options?: IOptionHelp[];
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
    // Constructor function for the command.
    //
    constructor: Function;

    //
    // Defines the --help option output for the command.
    //
    help: IDoulevoCommandHelp;
}