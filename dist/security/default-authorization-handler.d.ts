import { Claim, ClaimsIdentity } from "@nivinjoseph/n-sec";
import { type AuthorizationHandler } from "./authorization-handler.js";
export declare class DefaultAuthorizationHandler implements AuthorizationHandler {
    authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>;
}
//# sourceMappingURL=default-authorization-handler.d.ts.map