import { AuthenticationHandler, ClaimsIdentity, Claim } from "../../src/index";


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