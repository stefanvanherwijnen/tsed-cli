import {$log, Get} from "@tsed/common";
import {Interactions, OidcCtx, DefaultPolicy} from "@tsed/oidc-provider";
import {LoginInteraction} from "../interactions/LoginInteraction";
import {ConsentInteraction} from "../interactions/ConsentInteraction";

@Interactions({
  path: "/interaction/:uid",
  children: [
    LoginInteraction,
    ConsentInteraction
  ]
})
export class InteractionsCtrl {
  @Get("/")
  async promptInteraction(@OidcCtx() oidcCtx: OidcCtx) {
    return oidcCtx.runInteraction();
  }
}
