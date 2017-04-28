import "reflect-metadata";
import { given } from "n-defensive";
import "n-ext";


export const httpRouteSymbol = Symbol("httpRoute");

// public
export function route(route: string): Function
{
    given(route, "route").ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace(), "cannot be empty or whitespace")
        .ensure(t => t.trim().startsWith("/"), "has to begin with '/'");
    
    return (target: Function) => Reflect.defineMetadata(httpRouteSymbol, route.trim(), target);
}