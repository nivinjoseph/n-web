import { ClaimsIdentity, Claim } from "n-sec";
export interface AuthorizationHandler {
    authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>;
}
