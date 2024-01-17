import { given } from "@nivinjoseph/n-defensive";
import { Controller } from "./controller.js";
export const httpRouteSymbol = Symbol.for("@nivinjoseph/n-web/httpRoute");
// public
export function route(route) {
    given(route, "route").ensureHasValue().ensureIsString()
        .ensure(t => t.trim().startsWith("/"), "has to begin with '/'");
    const decorator = function (target, context) {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "route decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString()
            .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with route must extend Controller class`);
        context.metadata[httpRouteSymbol] = route;
    };
    return decorator;
}
//# sourceMappingURL=route.js.map