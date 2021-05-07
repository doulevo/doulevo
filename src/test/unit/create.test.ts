import { disableInjector, enableInjector } from "@codecapers/fusion";
import { CreateCommand } from "../../commands/create";

describe("create", () => {

    beforeAll(() => {
        //
        // Disable DI. Don't need it for unit tests.
        //
        disableInjector();
    });

    afterAll(() => {
        //
        // Renable DI.
        //
        enableInjector();
    });

    it("can create a new project", async ()  => {

        const projectDir = "a-new-project";
        const cwd = "a-directory";

        const cmd = new CreateCommand();
        const args: any = {

        };
        const mockConfiguration: any = {
            getMainCommand: () => projectDir,
            getArg: (name: string) => {
                return args[name];
            },
            getCreateTemplatePath: () => "the-template-path",
        };
        cmd.configuration = mockConfiguration;
        const mockFs: any = {
            exists: async (path: string) => {
                return false;
            },
        };
        cmd.fs = mockFs;
        const mockUpdatePlugin = jest.fn();
        const mockPluginManager: any = {
            updatePlugin: mockUpdatePlugin,
        };
        cmd.pluginManager = mockPluginManager;
        const mockLog: any = {
            debug: () => {},
            info: () => {},
        };
        cmd.log = mockLog;
        const mockTemplateExport = jest.fn();
        const mockTemplateManager: any = {
            export: mockTemplateExport,
        };
        cmd.templateManager = mockTemplateManager;
        const mockCreateNewRepo = jest.fn();
        const mockGit: any = {
            createNewRepo: mockCreateNewRepo,
        };
        cmd.git = mockGit;
        const mockEnv: any = {
            cwd: () => cwd,
        };
        cmd.environment = mockEnv;

        // Invokes the command.
        await cmd.invoke();

        // Plugin is updated before creating project.
        expect(mockUpdatePlugin).toHaveBeenCalledTimes(1);

        // New project is exported from template.
        expect(mockTemplateExport).toHaveBeenCalledTimes(1);
        expect(mockTemplateExport).toHaveBeenCalledWith(projectDir, `${cwd}/${projectDir}`);

        // Git repo is created for new project.
        expect(mockCreateNewRepo).toHaveBeenCalledTimes(1);
    });

    //
    //todo: 
    //
    // error when no main command / project dir.
    // move cwd() fn to IEnvironment.
    // test code path where project exists
    //      and force overwrite
    //      or error
    //
    // test services that can be tested!
    //

});
