"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// public
class DefaultAuthorizationHandler {
    authorize(identity, authorizeClaims) {
        return Promise.resolve(authorizeClaims.every(t => identity.hasClaim(t)));
    }
}
exports.DefaultAuthorizationHandler = DefaultAuthorizationHandler;
//# sourceMappingURL=default-authorization-handler.js.map