// public
export class DefaultAuthorizationHandler {
    authorize(identity, authorizeClaims) {
        return Promise.resolve(authorizeClaims.every(t => identity.hasClaim(t)));
    }
}
//# sourceMappingURL=default-authorization-handler.js.map