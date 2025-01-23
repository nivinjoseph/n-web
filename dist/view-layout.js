import { given } from "@nivinjoseph/n-defensive";
import { Controller } from "./controller.js";
export const viewLayoutSymbol = Symbol.for("@nivinjoseph/n-web/viewLayout");
// public
export function viewLayout(file) {
    given(file, "file").ensureHasValue().ensureIsString();
    const decorator = function (target, context) {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "viewLayout decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString()
            .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with viewLayout must extend Controller class`);
        context.metadata[viewLayoutSymbol] = file;
    };
    return decorator;
}
//# sourceMappingURL=view-layout.js.map