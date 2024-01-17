import { given } from "@nivinjoseph/n-defensive";
import { Controller } from "./controller.js";
export const viewSymbol = Symbol.for("@nivinjoseph/n-web/view");
// public
export function view(file) {
    given(file, "file").ensureHasValue().ensureIsString();
    const decorator = function (target, context) {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "view decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString()
            .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with view must extend Controller class`);
        context.metadata[viewSymbol] = file;
    };
    return decorator;
}
//# sourceMappingURL=view.js.map