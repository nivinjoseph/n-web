import "reflect-metadata";
import { given } from "@nivinjoseph/n-defensive";


export const httpRouteSymbol = Symbol.for("@nivinjoseph/n-web/httpRoute");

// public
export function route(route: string): Function
{
    given(route, "route").ensureHasValue().ensureIsString()
        .ensure(t => t.trim().startsWith("/"), "has to begin with '/'");
    
    return (target: Function) => Reflect.defineMetadata(httpRouteSymbol, route.trim(), target);
}