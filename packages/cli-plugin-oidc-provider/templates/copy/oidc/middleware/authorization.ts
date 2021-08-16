import {HeaderParams, IMiddleware, Middleware, Req, $log} from "@tsed/common";
import {OidcCtx, OidcProvider} from "@tsed/oidc-provider";

@Middleware()
export class AuthorizationMiddleware implements IMiddleware {
  constructor(private readonly provider: OidcProvider) {
  }

  async use(
    @Req() request: Req,
    @HeaderParams('Authorization') bearer: string
  ) {
    const token = bearer.replace('Bearer ', '')
    $log.info(token)
    const check = await this.provider.raw.AccessToken.find(token)
    $log.info(check)
  }
}
