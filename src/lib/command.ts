
//
// Interface for a command.
//
export interface ICommand {

    //
    // Invokes the command.
    //
    invoke(argv: any, appData: string): Promise<void>;
}