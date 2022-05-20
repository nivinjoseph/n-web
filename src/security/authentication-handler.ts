import { ClaimsIdentity } from "@nivinjoseph/n-sec";


// public 
export interface AuthenticationHandler
{
    authenticate(scheme: string, token: string): Promise<ClaimsIdentity | null>;
}