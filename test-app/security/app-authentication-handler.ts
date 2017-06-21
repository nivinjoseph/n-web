import { AuthenticationHandler } from "../../src/index";
import { ClaimsIdentity, Claim } from "n-sec";


export class AppAuthenticationHandler implements AuthenticationHandler
{
    public authenticate(scheme: string, token: string): Promise<ClaimsIdentity>
    {
        let identity: ClaimsIdentity = null;
        
        if (scheme === "bearer" && token === "dev")
            identity = new ClaimsIdentity([new Claim("claim1", true)]);
        
        return Promise.resolve(identity);
    }
}