import { DefaultAuthorizationHandler } from "../../src/index";
import { ClaimsIdentity, Claim } from "@nivinjoseph/n-sec";


export class AppAuthorizationHandler extends DefaultAuthorizationHandler
{
    public override authorize(identity: ClaimsIdentity, authorizeClaims: ReadonlyArray<Claim>): Promise<boolean>
    {
        return super.authorize(identity, authorizeClaims);
    }
}