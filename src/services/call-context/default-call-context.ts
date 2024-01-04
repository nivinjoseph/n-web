import { CallContext } from "./call-context.js";
import { Scope } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import { URL } from "node:url";
import { Profiler } from "@nivinjoseph/n-util";
import { Context } from "koa";


export class DefaultCallContext implements CallContext
{
    private _ctx!: Context;
    private _authHeaders!: ReadonlyArray<string>;
    private _hasAuth = false;
    private _authScheme: string | null = null;
    private _authToken: string | null = null;
    
    
    public get dependencyScope(): Scope { return this._ctx.state.scope as Scope; }
    public get protocol(): string { return this._ctx.request.protocol; }
    public get isSecure(): boolean { return this._ctx.request.secure; }
    public get href(): string { return this._ctx.request.href; }
    public get url(): URL { return this._ctx.request.URL; }
    public get pathParams(): Object { return JSON.parse(JSON.stringify(this._ctx.params)) as Object; }
    public get queryParams(): Object { return JSON.parse(JSON.stringify(this._ctx.query)) as Object; }
    public get hasAuth(): boolean { return this._hasAuth; }
    public get authScheme(): string | null { return this._authScheme; }
    public get authToken(): string | null { return this._authToken; }
    public get isAuthenticated(): boolean { return this.identity != null; }
    public get identity(): ClaimsIdentity | null { return this._ctx.state.identity as ClaimsIdentity; }
    public get profiler(): Profiler | undefined { return this._ctx.state.profiler as Profiler; }
    
    
    public configure(ctx: Context, authHeaders: ReadonlyArray<string>): void
    {
        given(ctx, "ctx").ensureHasValue().ensureIsObject();
        given(authHeaders, "authHeaders").ensureHasValue().ensureIsArray();
        
        this._ctx = ctx;
        this._authHeaders = authHeaders;
        this._populateSchemeAndToken();
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
    
    
    private _populateSchemeAndToken(): void
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
                
                const scheme = splitted[0].trim().toLowerCase();
                const token = splitted[1].trim();
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