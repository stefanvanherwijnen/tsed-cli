import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

@Module({
  imports: []
})
export class CliPluginObjectionModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-objection")
  install() {
    this.packageJson.addDependencies({
      "@tsed/objection": this.packageJson.dependencies["@tsed/common"],
      objection: "latest",
      knex: "latest"
    });
  }
}
