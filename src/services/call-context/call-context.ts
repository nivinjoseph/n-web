import { Scope } from "n-ject";
import { ClaimsIdentity } from "n-sec";
import * as Koa from "koa";


// public
export interface CallContext
{
    dependencyScope: Scope;
    hasAuth: boolean;
    authScheme: string;
    authToken: string;
    isAuthenticated: boolean;
    identity: ClaimsIdentity;
    ctx: Koa.Context;
}