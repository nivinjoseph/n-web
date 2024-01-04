import { Claim } from "@nivinjoseph/n-sec";


export class AppClaims
{
    public static readonly claim1 = new Claim("claim1", true);

    public static readonly claim2 = new Claim("claim2", "f00");

    private constructor() { }
}
