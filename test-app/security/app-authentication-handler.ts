import { AuthenticationHandler } from "../../src/index";
import { ClaimsIdentity, Claim } from "@nivinjoseph/n-sec";


export class AppAuthenticationHandler implements AuthenticationHandler
{
    public async authenticate(scheme: string, token: string): Promise<ClaimsIdentity | null>
    {
        if (scheme === "bearer" && token === "dev")
            return new ClaimsIdentity([new Claim("claim1", true)]);
            
        return null;
    }
}