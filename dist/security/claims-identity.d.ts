import { Claim } from "./claim";
export declare class ClaimsIdentity {
    private readonly _claims;
    readonly claims: ReadonlyArray<Claim>;
    constructor(claims: ReadonlyArray<Claim>);
    hasClaim(claim: Claim): boolean;
}
