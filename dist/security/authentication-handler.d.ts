import { ClaimsIdentity } from "./claims-identity";
export interface AuthenticationHandler {
    authenticate(scheme: string, token: string): Promise<ClaimsIdentity>;
}
