import { ClaimsIdentity, Claim } from "@nivinjoseph/n-sec";
export interface AuthorizationHandler {
    authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>;
}
//# sourceMappingURL=authorization-handler.d.ts.map