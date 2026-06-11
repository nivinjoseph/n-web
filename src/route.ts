import { given } from "@nivinjoseph/n-defensive";
import { Controller, type ControllerClass } from "./controller.js";
import type { ControllerRoute } from "./route-params.js";


export const httpRouteSymbol = Symbol.for("@nivinjoseph/n-web/httpRoute");

// When a controller declares the route it serves (via the TRoute type param on QueryController/
// CommandController), the decorator argument must match it; otherwise this resolves to an
// error-branded type that makes the class unassignable, surfacing the drift at compile time.
// Controllers that don't declare a route (e.g. plain Controllers) have route type `string`, so any
// route is accepted.
type EnforceRoute<This, TRoute extends string> =
    TRoute extends ControllerRoute<This>
        ? unknown
        // On mismatch, resolve to an object whose single required key IS the diagnostic message
        // (with the actual routes interpolated). TypeScript reports it as "Property '<message>' is
        // missing ...", so the otherwise-cryptic error reads as a real explanation of the drift.
        : { [K in `Route drift: @route(${TRoute}) does not match the route this controller declares (${ControllerRoute<This>})`]: never };

// public
export function route<const TRoute extends string>(
    route: TRoute
): <This extends Controller>(
    target: ControllerClass<This> & EnforceRoute<This, TRoute>,
    context: ClassDecoratorContext<ControllerClass<This>>
) => void
{
    given(route, "route").ensureHasValue().ensureIsString()
        .ensure(t => t.trim().startsWith("/"), "has to begin with '/'");

    const decorator = function <This extends Controller>(
        target: ControllerClass<This> & EnforceRoute<This, TRoute>,
        context: ClassDecoratorContext<ControllerClass<This>>
    ): void
    {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "route decorator should only be used on a class");

        const className = context.name || "<anonymous>";
        given(target as ControllerClass<This>, "target")
            .ensureHasValue()
            .ensure(t => t.prototype instanceof Controller, `class '${className}' decorated with route must extend Controller class`);

        context.metadata[httpRouteSymbol] = route;
    };

    return decorator;
}


export type ControllerRouteDecorator<This extends Controller> = (
    target: ControllerClass<This>,
    context: ClassDecoratorContext<ControllerClass<This>>
) => void;