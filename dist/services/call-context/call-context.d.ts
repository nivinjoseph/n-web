import { Scope } from "n-ject";
import { ClaimsIdentity } from "../../security/claims-identity";
export interface CallContext {
    dependencyScope: Scope;
    hasAuth: boolean;
    authScheme: string;
    authToken: string;
    isAuthenticated: boolean;
    identity: ClaimsIdentity;
}
