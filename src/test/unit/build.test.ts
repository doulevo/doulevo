import { disableInjector, enableInjector } from "@codecapers/fusion";
import { BuildCommand } from "../../commands/build";
import { Plugin } from "../../lib/plugin";
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
        const pluginPath = "the-plugin";
        const projectConfiguration = {
            localPluginPath: pluginPath,
        };
        const pluginConfiguration = {};

        const cmd = new BuildCommand();
        const args: any = {

        };
        const mockConfiguration: any = {
            getArg: (name: string) => {
                return args[name];
            },
            getArrayArg: (name: string) => {
                return args[name] || [];
            },
        };
        cmd.configuration = mockConfiguration;
        const mockFs: any = {
            readJsonFile: async (path: string) => {
                if (path === `${cwd}/doulevo.json`) {
                    return projectConfiguration;
                }
                else if (path === `${pluginPath}/plugin.json`) {
                    return pluginConfiguration;
                }
                else {
                    throw new Error(`Unexpected file load for ${path}.`);
                }
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
            listProjectImages: async () => {
                return [];
            },
        };
        cmd.docker = mockDocker;
        const mockProgressIndicator: any = {
            start: () => {},
            fail: () => {},
            succeed: () => {},
        };
        cmd.progressIndicator = mockProgressIndicator;
        const mockLog: any = {
            info: () => {},
        }
        cmd.log = mockLog;

        // Invokes the command.
        await cmd.invoke();

        // Docker build is invoked.
        expect(mockDockerBuild).toHaveBeenCalledTimes(1);
        expect(mockDockerBuild).toHaveBeenCalledWith(
            new Project(cwd, projectConfiguration),
            "dev",
            [],
            new Plugin(pluginPath, pluginConfiguration)
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
