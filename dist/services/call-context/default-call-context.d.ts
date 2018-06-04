/// <reference types="koa-router" />
import { CallContext } from "./call-context";
import { Scope } from "@nivinjoseph/n-ject";
import * as Koa from "koa";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import "@nivinjoseph/n-ext";
export declare class DefaultCallContext implements CallContext {
    private _ctx;
    private _authHeader;
    private _hasAuth;
    private _authScheme;
    private _authToken;
    readonly dependencyScope: Scope;
    readonly pathParams: Object;
    readonly queryParams: Object;
    readonly hasAuth: boolean;
    readonly authScheme: string;
    readonly authToken: string;
    readonly isAuthenticated: boolean;
    readonly identity: ClaimsIdentity;
    configure(ctx: Koa.Context, authHeader: string): void;
    getRequestHeader(header: string): string;
    setResponseType(responseType: string): void;
    setResponseContentDisposition(contentDisposition: string): void;
    setResponseHeader(header: string, value: string): void;
    private populateSchemeAndToken;
}
