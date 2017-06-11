import { ClaimsIdentity, Claim, DefaultAuthorizationHandler } from "../../src/index";


export class AppAuthorizationHandler extends DefaultAuthorizationHandler
{
    public authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>
    {
        return super.authorize(identity, authorizeClaims);
    }
}