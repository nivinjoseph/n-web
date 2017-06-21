import { ClaimsIdentity, Claim } from "n-sec";


// public
export interface AuthorizationHandler
{
    authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>;
}