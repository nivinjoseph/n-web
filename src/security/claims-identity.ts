import { Claim } from "./claim";
import { given } from "n-defensive";


// public
export class ClaimsIdentity
{
    private readonly _claims: Array<Claim>;
    
    
    public get claims(): ReadonlyArray<Claim> { return this._claims; }
    
    
    public constructor(claims: ReadonlyArray<Claim>)
    {
        given(claims, "claims").ensureHasValue();
        
        this._claims = [...claims];
    }
    
    
    public hasClaim(claim: Claim): boolean
    {
        return this._claims.some(t => t.type === claim.type && t.value === claim.value);
    }
}