import { Controller } from "./controller.js";
import { httpMethodSymbol, HttpMethods } from "./http-method.js";
import { given } from "@nivinjoseph/n-defensive";
// public
export function command(target, context) {
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "command decorator should only be used on a class");
    const className = context.name;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with command must extend Controller class`);
    context.metadata[httpMethodSymbol] = HttpMethods.Post;
}
//# sourceMappingURL=command.js.map