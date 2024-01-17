/// <reference types="node" resolution-mode="require"/>
import { Scope } from "@nivinjoseph/n-ject";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import { Profiler } from "@nivinjoseph/n-util";
import { URL } from "node:url";
export interface CallContext {
    dependencyScope: Scope;
    protocol: string;
    isSecure: boolean;
    href: string;
    url: URL;
    pathParams: Object;
    queryParams: Object;
    hasAuth: boolean;
    authScheme: string | null;
    authToken: string | null;
    isAuthenticated: boolean;
    identity: ClaimsIdentity | null;
    profiler?: Profiler;
    getRequestHeader(header: string): string;
    setResponseType(responseType: string): void;
    setResponseContentDisposition(contentDisposition: string): void;
    setResponseHeader(header: string, value: string): void;
}
//# sourceMappingURL=call-context.d.ts.map