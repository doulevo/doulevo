
//
// Interface for a command.
//
export interface ICommand {

    //
    // Invokes the command.
    //
    invoke(): Promise<void>;
}