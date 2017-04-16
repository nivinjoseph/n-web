import "reflect-metadata";
import { given } from "n-defensive";
import "n-ext";

export const httpRouteSymbol = Symbol("httpRoute");

// public
export function httpRoute(route: string): Function
{
    given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
    
    return (target: Function) => Reflect.defineMetadata(httpRouteSymbol, route, target);
}