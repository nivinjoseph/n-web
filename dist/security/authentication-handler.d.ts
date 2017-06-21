import { ClaimsIdentity } from "n-sec";
export interface AuthenticationHandler {
    authenticate(scheme: string, token: string): Promise<ClaimsIdentity>;
}
