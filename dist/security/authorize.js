import { given } from "@nivinjoseph/n-defensive";
import { Claim } from "@nivinjoseph/n-sec";
import { Controller } from "../controller.js";
export const authorizeSymbol = Symbol.for("@nivinjoseph/n-web/authorize");
// public
export function authorize(...claims) {
    given(claims, "claims").ensureIsArray()
        .ensure(t => t.every(c => c instanceof Claim), "authorize decorator only takes Claim objects");
    const decorator = function (target, context) {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "authorize decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString()
            .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with authorize must extend Controller class`);
        context.metadata[authorizeSymbol] = claims;
    };
    return decorator;
}
//# sourceMappingURL=authorize.js.map