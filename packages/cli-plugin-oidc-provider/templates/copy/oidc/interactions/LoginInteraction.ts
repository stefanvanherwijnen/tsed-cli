import {$log, BodyParams, Inject, Post, View, Res} from "@tsed/common";
import {Env} from "@tsed/core";
import {Constant} from "@tsed/di";
import {BadRequest, Unauthorized} from "@tsed/exceptions";
import {Interaction, OidcCtx, OidcSession, Params, Prompt, Uid} from "@tsed/oidc-provider";
import {Accounts} from "../../services/Accounts";
import {Account} from "../../models/Account";

@Interaction({
  name: "login"
})
export class LoginInteraction {
  @Constant("env")
  env: Env;

  @Inject()
  accounts: Accounts;

  @View("oidc/login")
  async $prompt(
    @OidcCtx() oidcCtx: OidcCtx,
    @Prompt() prompt: Prompt,
    @OidcSession() session: OidcSession,
    @Params() params: Params,
    @Uid() uid: Uid
  ): Promise<any> {
    const client = await oidcCtx.findClient();

    if (!client) {
      throw new Unauthorized(`Unknown client_id ${params.client_id}`);
    }

    return {
      client,
      uid,
      details: prompt.details,
      params,
      title: "Sign-in",
      flash: false,
      ...oidcCtx.debug(),
      registerUrl: "https://localhost:8083",
      passwordForgotUrl: "https://localhost:8083"
    };
  }

  @Post("/login")
  async submit(
    @Res() res: any,
    @BodyParams() body: any,
    @OidcSession() session: OidcSession,
    @Prompt() prompt: Prompt,
    @OidcCtx() oidcCtx: OidcCtx,
    @Uid() uid: Uid
  ) {
    if (prompt.name !== "login") {
      throw new BadRequest("Bad interaction name");
    }

    let { username, email, password } = body

    let user: Account | undefined
    if ((email || username) && password) {
      user = await this.accounts.authenticate({ email, username, password })
    }

    if (!user) {
      res.status(403);
      return {
        message: 'Invalid credentials'
      }
    }
    if (user && !user.emailVerified) {
      res.status(401);
      return {
        message: 'User not verified'
      }
    }

    return await oidcCtx.interactionFinished({
      login: {
        accountId: user._id
      }
    });
  }
}