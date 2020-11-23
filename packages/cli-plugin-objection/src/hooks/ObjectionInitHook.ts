import {InitCmdContext} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, ProjectPackageJson, RootRendererService, SrcRendererService} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {TEMPLATE_DIR} from "../utils/templateDir";
import {join} from "path";

@Injectable()
export class ObjectionInitHook {
  @Inject()
  protected packageJson: ProjectPackageJson;

  @Inject()
  protected rootRenderer: RootRendererService;

  @Inject()
  protected srcRenderer: SrcRendererService;

  @Inject()
  protected cliDockerComposeYaml: CliDockerComposeYaml;

  @OnExec("init")
  onExec(ctx: InitCmdContext) {
    this.addScripts();
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    return [
      {
        title: `Generate Knex connection file`,
        task: async () => {
          return this.srcRenderer.render(
            "knex.hbs",
            {},
            {
              templateDir: TEMPLATE_DIR,
              output: `KnexConnectionProvider.ts`,
              rootDir: join(this.srcRenderer.rootDir, "services", "connections")
            }
          );
        }
      }
    ];
  }

  addScripts() {
    this.packageJson.addScripts({});
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }
}
