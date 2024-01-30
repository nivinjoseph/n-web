import { given } from "@nivinjoseph/n-defensive";
import { Controller, type ControllerClass } from "./controller.js";


export const viewSymbol = Symbol.for("@nivinjoseph/n-web/view");

// public
export function view<This extends Controller>(file: string): ControllerViewDecorator<This>
{
    given(file, "file").ensureHasValue().ensureIsString();

    const decorator: ControllerViewDecorator<This> = function (target, context)
    {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "view decorator should only be used on a class");

        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString()
            .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with view must extend Controller class`);

        context.metadata[viewSymbol] = file;
    };

    return decorator;
}


export type ControllerViewDecorator<This extends Controller> = (
    target: ControllerClass<This>,
    context: ClassDecoratorContext<ControllerClass<This>>
) => void;