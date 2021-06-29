import {Command, CliDefaultOptions, CommandProvider, Inject, CliExeca, ProjectPackageJson} from "@tsed/cli-core";

export interface KnexContext extends CliDefaultOptions {
  command: string;
}

@Command({
  name: "knex",
  description: "Run a knex command",
  args: {
    command: {
      description: "The knex command",
      type: String,
      required: true
    }
  },
  options: {},
  allowUnknownOption: true
})
export class KnexCmd implements CommandProvider {
  @Inject()
  cliExeca: CliExeca;

  @Inject()
  projectPackageJson: ProjectPackageJson;

  async $exec(ctx: KnexContext) {
    return [
      {
        title: `Run Knex CLI ${ctx.command}`,
        task: () => {
          return this.cliExeca.run("npx", ["knex", ctx.command, ...ctx.rawArgs], {
            cwd: this.projectPackageJson.dir
          });
        }
      }
    ];
  }
}
