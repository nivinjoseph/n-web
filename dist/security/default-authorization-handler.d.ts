import { AuthorizationHandler } from "./authorization-handler";
import { ClaimsIdentity } from "./claims-identity";
import { Claim } from "./claim";
export declare class DefaultAuthorizationHandler implements AuthorizationHandler {
    authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>;
}
