import { AuthorizationHandler } from "./authorization-handler";
import { ClaimsIdentity, Claim } from "n-sec";


// public
export class DefaultAuthorizationHandler implements AuthorizationHandler
{
    public authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>
    {   
        return Promise.resolve(authorizeClaims.every(t => identity.hasClaim(t)));
    }
}