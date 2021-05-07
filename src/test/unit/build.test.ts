import { disableInjector, enableInjector } from "@codecapers/fusion";
import { BuildCommand } from "../../commands/build";
import { Project } from "../../lib/project";

describe("build", () => {

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

    it("can build a project", async ()  => {

        const cwd = "a-directory";

        const cmd = new BuildCommand();
        const args: any = {

        };
        const mockConfiguration: any = {
            getArg: (name: string) => {
                return args[name];
            },
        };
        cmd.configuration = mockConfiguration;
        const mockFs: any = {
            readJsonFile: async (path: string) => {
                expect(path).toEqual(`${cwd}/doulevo.json`);

                return {

                };
            },
        };
        cmd.fs = mockFs;
        const mockEnv: any = {
            cwd: () => cwd,
        };
        cmd.environment = mockEnv;
        const mockDockerBuild = jest.fn();
        const mockDocker: any = {
            build: mockDockerBuild,
        };
        cmd.docker = mockDocker;

        // Invokes the command.
        await cmd.invoke();

        // Docker build is invoked.
        expect(mockDockerBuild).toHaveBeenCalledTimes(1);
        expect(mockDockerBuild).toHaveBeenCalledWith(
            new Project(cwd, {}),
            "dev"
        );
    });

    //
    //todo: 
    //
    // test with "project" argument.
    // test with "mode" argument.
    // test that mode argument can only be dev or prod.
    //

});
