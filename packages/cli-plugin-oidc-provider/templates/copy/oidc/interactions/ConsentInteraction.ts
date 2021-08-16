import {$log, Inject, Post, Get, View} from "@tsed/common";
import {BadRequest} from "@tsed/exceptions";
import {Interaction, OidcCtx, OidcProvider, OidcSession, Params, Prompt, Uid} from "@tsed/oidc-provider";
import {Name} from "@tsed/schema";

@Interaction({
   name: "consent"
})
@Name("Oidc")
export class ConsentInteraction {
   @Inject()
   oidc: OidcProvider;

   @View("oidc/consent")
   async $prompt(@OidcCtx() oidcCtx: OidcCtx,
                 @Prompt() prompt: Prompt,
                 @OidcSession() session: OidcSession,
                 @Params() params: Params,
                 @Uid() uid: Uid): Promise<any> {
      $log.info('consent')
      const client = await oidcCtx.findClient();

      return {
         client,
         uid,
         details: prompt.details,
         params,
         title: "Authorize",
         ...oidcCtx.debug()
      };
   }

   @Post("/confirm")
   async confirm(@OidcCtx() oidcCtx: OidcCtx, @Prompt() prompt: Prompt) {
      if (prompt.name !== "consent") {
         throw new BadRequest("Bad interaction name");
      }

      const grant = await oidcCtx.getGrant();
      const details = prompt.details as {
         missingOIDCScope: string[],
         missingResourceScopes: Record<string, string[]>,
         missingOIDCClaims: string[]
      };

      const {missingOIDCScope, missingOIDCClaims, missingResourceScopes} = details;

      if (missingOIDCScope) {
         grant.addOIDCScope(missingOIDCScope.join(" "));
         // use grant.rejectOIDCScope to reject a subset or the whole thing
      }
      if (missingOIDCClaims) {
         grant.addOIDCClaims(missingOIDCScope);
         // use grant.rejectOIDCClaims to reject a subset or the whole thing
      }

      if (missingResourceScopes) {
         // eslint-disable-next-line no-restricted-syntax
         for (const [indicator, scopes] of Object.entries(missingResourceScopes)) {
            grant.addResourceScope(indicator, scopes.join(" "));
            // use grant.rejectResourceScope to reject a subset or the whole thing
         }
      }

      const grantId = await grant.save();

      const consent: any = {};

      if (!oidcCtx.grantId) {
         // we don't have to pass grantId to consent, we're just modifying existing one
         consent.grantId = grantId;
      }

      return await oidcCtx.interactionFinished({consent}, {mergeWithLastSubmission: true});
   }

   @Get("/abort")
   async abort(@OidcCtx() oidcCtx: OidcCtx, @Prompt() prompt: Prompt) {
      const result = {
         error: 'access_denied',
         error_description: 'End-User aborted interaction',
       };
       return await oidcCtx.interactionFinished(result, { mergeWithLastSubmission: true });
   }
}
