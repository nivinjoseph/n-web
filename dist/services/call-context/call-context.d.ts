/// <reference types="node" />
import { Scope } from "@nivinjoseph/n-ject";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";
import { Profiler } from "@nivinjoseph/n-util";
import { URL } from "url";
export interface CallContext {
    dependencyScope: Scope;
    protocol: string;
    isSecure: boolean;
    href: string;
    url: URL;
    pathParams: Object;
    queryParams: Object;
    hasAuth: boolean;
    authScheme: string;
    authToken: string;
    isAuthenticated: boolean;
    identity: ClaimsIdentity;
    profiler?: Profiler;
    getRequestHeader(header: string): string;
    setResponseType(responseType: string): void;
    setResponseContentDisposition(contentDisposition: string): void;
    setResponseHeader(header: string, value: string): void;
}
