import { Scope } from "@nivinjoseph/n-ject";
import { ClaimsIdentity } from "@nivinjoseph/n-sec";


// public
export interface CallContext
{
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
    setResponseHeader(header: string, value: string): void;
}