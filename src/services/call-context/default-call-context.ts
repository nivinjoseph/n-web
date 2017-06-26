import { CallContext } from "./call-context";
import { Scope } from "n-ject";
import { given } from "n-defensive";
import * as Koa from "koa";
import { ClaimsIdentity } from "n-sec";


export class DefaultCallContext implements CallContext
{
    private _ctx: Koa.Context;
    private _hasAuth: boolean = false;
    private _authScheme: string;
    private _authToken: string;
    
    
    public get dependencyScope(): Scope { return this._ctx.state.scope; }
    public get hasAuth(): boolean { return this._hasAuth; }
    public get authScheme(): string { return this._authScheme; }
    public get authToken(): string { return this._authToken; }
    public get isAuthenticated(): boolean { return this.identity !== undefined && this.identity !== null; }
    public get identity(): ClaimsIdentity { return this._ctx.state.identity; }
    public get ctx(): Koa.Context { return this._ctx; }
    
    
    public configure(ctx: Koa.Context): void
    {
        given(ctx, "ctx").ensureHasValue();
        
        this._ctx = ctx;
        this.populateSchemeAndToken();
    }
    
    
    private populateSchemeAndToken(): void
    {
        if (this._ctx.header && this._ctx.header.authorization)
        {
            let authorization: string = this._ctx.header.authorization;
            if (!authorization.isEmptyOrWhiteSpace())
            {
                authorization = authorization.trim();
                while (authorization.contains("  ")) // double space
                    authorization = authorization.replaceAll("  ", " ");    
                
                let splitted = authorization.split(" ");
                if (splitted.length === 2)
                {
                    let scheme = splitted[0].trim().toLowerCase();
                    let token = splitted[1].trim();
                    if (!scheme.isEmptyOrWhiteSpace() && !token.isEmptyOrWhiteSpace())
                    {
                        this._hasAuth = true;
                        this._authScheme = scheme;
                        this._authToken = token;
                    }
                }
            }
        } 
    }
}