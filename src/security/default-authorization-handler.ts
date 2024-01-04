import { AuthorizationHandler } from "./authorization-handler.js";
import { ClaimsIdentity, Claim } from "@nivinjoseph/n-sec";


// public
export class DefaultAuthorizationHandler implements AuthorizationHandler
{
    public authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>
    {   
        return Promise.resolve(authorizeClaims.every(t => identity.hasClaim(t)));
    }
}