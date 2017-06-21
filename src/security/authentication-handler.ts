import { ClaimsIdentity } from "n-sec";


// public 
export interface AuthenticationHandler
{
    authenticate(scheme: string, token: string): Promise<ClaimsIdentity>;
}