import { ClaimsIdentity } from "./claims-identity";


// public 
export interface AuthenticationHandler
{
    authenticate(scheme: string, token: string): Promise<ClaimsIdentity>;
}