"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAuthorizationHandler = void 0;
// public
class DefaultAuthorizationHandler {
    authorize(identity, authorizeClaims) {
        return Promise.resolve(authorizeClaims.every(t => identity.hasClaim(t)));
    }
}
exports.DefaultAuthorizationHandler = DefaultAuthorizationHandler;
//# sourceMappingURL=default-authorization-handler.js.map