import { Scope } from "n-ject";
import { ClaimsIdentity } from "n-sec";
export interface CallContext {
    dependencyScope: Scope;
    pathParams: Object;
    queryParams: Object;
    hasAuth: boolean;
    authScheme: string;
    authToken: string;
    isAuthenticated: boolean;
    identity: ClaimsIdentity;
    setResponseType(responseType: string): void;
    setResponseContentDisposition(contentDisposition: string): void;
}
