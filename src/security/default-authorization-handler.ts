import { Claim, ClaimsIdentity } from "@nivinjoseph/n-sec";
import { type AuthorizationHandler } from "./authorization-handler.js";


// public
export class DefaultAuthorizationHandler implements AuthorizationHandler
{
    public authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>
    {   
        return Promise.resolve(authorizeClaims.every(t => identity.hasClaim(t)));
    }
}