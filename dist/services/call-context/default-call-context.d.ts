/// <reference types="node" />
import { CallContext } from "./call-context";
import { Scope } from "@nivinjoseph/n-ject";
import * as Koa from "koa";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import { URL } from "url";
import { Profiler } from "@nivinjoseph/n-util";
export declare class DefaultCallContext implements CallContext {
    private _ctx;
    private _authHeaders;
    private _hasAuth;
    private _authScheme;
    private _authToken;
    get dependencyScope(): Scope;
    get protocol(): string;
    get isSecure(): boolean;
    get href(): string;
    get url(): URL;
    get pathParams(): Object;
    get queryParams(): Object;
    get hasAuth(): boolean;
    get authScheme(): string;
    get authToken(): string;
    get isAuthenticated(): boolean;
    get identity(): ClaimsIdentity;
    get profiler(): Profiler | undefined;
    configure(ctx: Koa.Context, authHeaders: ReadonlyArray<string>): void;
    getRequestHeader(header: string): string;
    setResponseType(responseType: string): void;
    setResponseContentDisposition(contentDisposition: string): void;
    setResponseHeader(header: string, value: string): void;
    private populateSchemeAndToken;
}
