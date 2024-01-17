import { AuthorizationHandler } from "./authorization-handler.js";
import { ClaimsIdentity, Claim } from "@nivinjoseph/n-sec";
export declare class DefaultAuthorizationHandler implements AuthorizationHandler {
    authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>;
}
//# sourceMappingURL=default-authorization-handler.d.ts.map