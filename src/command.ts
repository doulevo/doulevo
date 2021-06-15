
//
// Interface for a command.
//
export interface ICommand {

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
    description: string;

    //
    // The default value for the option.
    //
    defaultValue?: string;
}

//
// Describes the help output for a particular command.
//
export interface ICommandHelp {
    // 
    // Shows how to use the command.
    // 
    usage: string;

    //
    // Describes what the command does.
    //
    description: string;

    //
    // Describes the options for the command.
    //
    options?: IOptionHelp[];
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
    // Constructor function for the command.
    //
    constructor: Function;

    //
    // Sub-commands under the command.
    //
    subCommands?: ICommandDesc[];

    //
    // Defines the --help output for the command.
    //
    help: ICommandHelp;
}