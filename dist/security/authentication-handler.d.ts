import { ClaimsIdentity } from "@nivinjoseph/n-sec";
export interface AuthenticationHandler {
    authenticate(scheme: string, token: string): Promise<ClaimsIdentity | null>;
}
//# sourceMappingURL=authentication-handler.d.ts.map