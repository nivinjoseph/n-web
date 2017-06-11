/// <reference types="koa" />
/// <reference types="koa-router" />
import { CallContext } from "./call-context";
import { Scope } from "n-ject";
import * as Koa from "koa";
import { ClaimsIdentity } from "../../security/claims-identity";
export declare class DefaultCallContext implements CallContext {
    private _ctx;
    private _hasAuth;
    private _authScheme;
    private _authToken;
    readonly dependencyScope: Scope;
    readonly hasAuth: boolean;
    readonly authScheme: string;
    readonly authToken: string;
    readonly isAuthenticated: boolean;
    readonly identity: ClaimsIdentity;
    configure(ctx: Koa.Context): void;
    private populateSchemeAndToken();
}
