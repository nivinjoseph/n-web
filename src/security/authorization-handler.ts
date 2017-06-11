import { ClaimsIdentity } from "./claims-identity";
import { Claim } from "./claim";


// public
export interface AuthorizationHandler
{
    authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>;
}