import { Claim, ClaimsIdentity } from "@nivinjoseph/n-sec";
import {} from "./authorization-handler.js";
// public
export class DefaultAuthorizationHandler {
    authorize(identity, authorizeClaims) {
        return Promise.resolve(authorizeClaims.every(t => identity.hasClaim(t)));
    }
}
//# sourceMappingURL=default-authorization-handler.js.map