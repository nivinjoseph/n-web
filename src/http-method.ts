import { Controller, ControllerClass } from "./controller.js";
import { given } from "@nivinjoseph/n-defensive";

export class HttpMethods
{
    private static readonly _get = "GET";
    private static readonly _post = "POST";
    private static readonly _put = "PUT";
    private static readonly _delete = "DELETE";


    public static get Get(): string { return this._get; }
    public static get Post(): string { return this._post; }
    public static get Put(): string { return this._put; }
    public static get Delete(): string { return this._delete; }
}

export const httpMethodSymbol = Symbol.for("@nivinjoseph/n-web/httpMethod");

// public
export function httpGet<This extends Controller>(target: ControllerClass<This>,
    context: ClassDecoratorContext<ControllerClass<This>>): void
{
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "httpGet decorator should only be used on a class");

    const className = context.name!;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with httpGet must extend Controller class`);

    context.metadata[httpMethodSymbol] = HttpMethods.Get;
}


// public
export function httpPost<This extends Controller>(target: ControllerClass<This>,
    context: ClassDecoratorContext<ControllerClass<This>>): void
{
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "httpPost decorator should only be used on a class");

    const className = context.name!;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with httpPost must extend Controller class`);

    context.metadata[httpMethodSymbol] = HttpMethods.Post;
}


// public
export function httpPut<This extends Controller>(target: ControllerClass<This>,
    context: ClassDecoratorContext<ControllerClass<This>>): void
{
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "httpPut decorator should only be used on a class");

    const className = context.name!;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with httpPut must extend Controller class`);

    context.metadata[httpMethodSymbol] = HttpMethods.Put;
}


// public
export function httpDelete<This extends Controller>(target: ControllerClass<This>,
    context: ClassDecoratorContext<ControllerClass<This>>): void
{
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "httpDelete decorator should only be used on a class");

    const className = context.name!;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with httpDelete must extend Controller class`);

    context.metadata[httpMethodSymbol] = HttpMethods.Delete;
}