import { given } from "@nivinjoseph/n-defensive";
import { type AbstractControllerClass, Controller } from "./controller.js";
import { HttpMethods, httpMethodSymbol } from "./http-method.js";


// public
export function query<This extends Controller>(target: AbstractControllerClass<This>,
    context: ClassDecoratorContext<AbstractControllerClass<This>>): void
{
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "query decorator should only be used on a class");

    const className = context.name || "<anonymous>";
    given(target, "target")
        .ensureHasValue()
        .ensure(t => t.prototype instanceof Controller, `class '${className}' decorated with query must extend Controller class`);

    context.metadata[httpMethodSymbol] = HttpMethods.Get;
}