import { given } from "@nivinjoseph/n-defensive";
import { Controller } from "./controller.js";
import { HttpMethods, httpMethodSymbol } from "./http-method.js";
// public
export function query(target, context) {
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "query decorator should only be used on a class");
    const className = context.name;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with query must extend Controller class`);
    context.metadata[httpMethodSymbol] = HttpMethods.Get;
}
//# sourceMappingURL=query.js.map