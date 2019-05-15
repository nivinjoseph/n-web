/// <reference types="node" />
import { CallContext } from "./call-context";
import { Scope } from "@nivinjoseph/n-ject";
import * as Koa from "koa";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import "@nivinjoseph/n-ext";
import { URL } from "url";
export declare class DefaultCallContext implements CallContext {
    private _ctx;
    private _authHeaders;
    private _hasAuth;
    private _authScheme;
    private _authToken;
    readonly dependencyScope: Scope;
    readonly protocol: string;
    readonly isSecure: boolean;
    readonly href: string;
    readonly url: URL;
    readonly pathParams: Object;
    readonly queryParams: Object;
    readonly hasAuth: boolean;
    readonly authScheme: string;
    readonly authToken: string;
    readonly isAuthenticated: boolean;
    readonly identity: ClaimsIdentity;
    configure(ctx: Koa.Context, authHeaders: ReadonlyArray<string>): void;
    getRequestHeader(header: string): string;
    setResponseType(responseType: string): void;
    setResponseContentDisposition(contentDisposition: string): void;
    setResponseHeader(header: string, value: string): void;
    private populateSchemeAndToken;
}
