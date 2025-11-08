import type { Scope } from "@nivinjoseph/n-ject";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import { Profiler } from "@nivinjoseph/n-util";
import type { Context } from "koa";
import { URL } from "node:url";
import type { CallContext } from "./call-context.js";
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
    get authScheme(): string | null;
    get authToken(): string | null;
    get isAuthenticated(): boolean;
    get identity(): ClaimsIdentity | null;
    get profiler(): Profiler | undefined;
    configure(ctx: Context, authHeaders: ReadonlyArray<string>): void;
    getRequestHeader(header: string): string;
    setResponseType(responseType: string): void;
    setResponseContentDisposition(contentDisposition: string): void;
    setResponseHeader(header: string, value: string): void;
    private _populateSchemeAndToken;
}
//# sourceMappingURL=default-call-context.d.ts.map