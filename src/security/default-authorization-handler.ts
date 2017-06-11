import { AuthorizationHandler } from "./authorization-handler";
import { ClaimsIdentity } from "./claims-identity";
import { Claim } from "./claim";


// public
export class DefaultAuthorizationHandler implements AuthorizationHandler
{
    public authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>
    {   
        return Promise.resolve(authorizeClaims.every(t => identity.hasClaim(t)));
    }
}