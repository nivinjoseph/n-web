import { Claim, ClaimsIdentity } from "@nivinjoseph/n-sec";
import { type AuthenticationHandler } from "../../src/index.js";


export class AppAuthenticationHandler implements AuthenticationHandler
{
    public async authenticate(scheme: string, token: string): Promise<ClaimsIdentity | null>
    {
        if (scheme === "bearer" && token === "dev")
            return new ClaimsIdentity([new Claim("claim1", true)]);
            
        return null;
    }
}