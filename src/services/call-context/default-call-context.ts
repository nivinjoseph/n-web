import { CallContext } from "./call-context";
import { Scope } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import * as Koa from "koa";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import "@nivinjoseph/n-ext";
import { URL } from "url";


export class DefaultCallContext implements CallContext
{
    private _ctx: Koa.Context;
    private _authHeaders: ReadonlyArray<string>;
    private _hasAuth: boolean = false;
    private _authScheme: string;
    private _authToken: string;
    
    
    public get dependencyScope(): Scope { return this._ctx.state.scope; }
    public get protocol(): string { return this._ctx.request.protocol; }
    public get isSecure(): boolean { return this._ctx.request.secure; }
    public get href(): string { return this._ctx.request.href; }
    public get url(): URL { return this._ctx.request.URL; }
    public get pathParams(): Object { return JSON.parse(JSON.stringify(this._ctx.params)); }
    public get queryParams(): Object { return JSON.parse(JSON.stringify(this._ctx.query)); }
    public get hasAuth(): boolean { return this._hasAuth; }
    public get authScheme(): string { return this._authScheme; }
    public get authToken(): string { return this._authToken; }
    public get isAuthenticated(): boolean { return this.identity !== undefined && this.identity !== null; }
    public get identity(): ClaimsIdentity { return this._ctx.state.identity; }
    
    
    public configure(ctx: Koa.Context, authHeaders: ReadonlyArray<string>): void
    {
        given(ctx, "ctx").ensureHasValue().ensureIsObject();
        given(authHeaders, "authHeaders").ensureHasValue().ensureIsArray();
        
        this._ctx = ctx;
        this._authHeaders = authHeaders;
        this.populateSchemeAndToken();
    }
    
    
    public getRequestHeader(header: string): string
    {
        given(header, "header").ensureHasValue().ensureIsString().ensure(t => !t.isEmptyOrWhiteSpace());
        
        return this._ctx.get(header);
    }
    
    public setResponseType(responseType: string): void
    {
        given(responseType, "responseType")
            .ensureHasValue()
            .ensureIsString()
            .ensure(t => !t.isEmptyOrWhiteSpace());
        
        this._ctx.response.type = responseType.trim();
    }
    
    public setResponseContentDisposition(contentDisposition: string): void
    {
        given(contentDisposition, "contentDisposition")
            .ensureHasValue()
            .ensureIsString()
            .ensure(t => !t.isEmptyOrWhiteSpace());
        
        this._ctx.response.set({
            "Content-Disposition": contentDisposition.trim()
        });
    }
    
    public setResponseHeader(header: string, value: string): void
    {
        given(header, "header").ensureHasValue().ensureIsString().ensure(t => !t.isEmptyOrWhiteSpace());
        given(value, "value").ensureHasValue().ensureIsString();
        
        this._ctx.set(header, value);
    }
    
    
    private populateSchemeAndToken(): void
    {
        if (this._ctx.header)
        {
            for (let i = 0; i < this._authHeaders.length; i++)
            {
                const authHeader = this._authHeaders[i];
                if (!this._ctx.header[authHeader])
                    continue;
                
                let authorization: string = this._ctx.header[authHeader] as string;
                if (authorization.isEmptyOrWhiteSpace())
                    continue;
                
                authorization = authorization.trim();
                while (authorization.contains("  ")) // double space
                    authorization = authorization.replaceAll("  ", " ");

                const splitted = authorization.split(" ");
                if (splitted.length !== 2)
                    continue;
                
                let scheme = splitted[0].trim().toLowerCase();
                let token = splitted[1].trim();
                if (scheme.isEmptyOrWhiteSpace() || token.isEmptyOrWhiteSpace())
                    continue;
                
                this._hasAuth = true;
                this._authScheme = scheme;
                this._authToken = token;
                break;
            }
        } 
    }
}