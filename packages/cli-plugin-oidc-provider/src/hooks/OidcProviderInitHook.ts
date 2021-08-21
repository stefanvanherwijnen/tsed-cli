import {InitCmdContext} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, ProjectPackageJson, RootRendererService, SrcRendererService} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {TEMPLATE_DIR} from "../utils/templateDir";
import {copy} from 'fs-extra';
import {join} from 'path';

@Injectable()
export class OidcProviderInitHook {
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
        title: "Copy source folder",
        task: async () => {
          return copy(join(TEMPLATE_DIR, 'src'), this.srcRenderer.rootDir)
        }
      },
      {
        title: 'Generate config file',
        task: async () => this.generateConfig()
      }
    ];
  }

  addScripts() {}

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }

  generateConfig () {
    return this.srcRenderer.render(
      "oidcConfig.hbs",
      {},
      {
        templateDir: TEMPLATE_DIR,
        output: `index.ts`,
        rootDir: join(this.srcRenderer.rootDir, "config", "oidc")
      }
    );
  }
}
