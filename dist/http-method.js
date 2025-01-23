import { given } from "@nivinjoseph/n-defensive";
import { Controller } from "./controller.js";
export class HttpMethods {
    static _get = "GET";
    static _post = "POST";
    static _put = "PUT";
    static _delete = "DELETE";
    static get Get() { return this._get; }
    static get Post() { return this._post; }
    static get Put() { return this._put; }
    static get Delete() { return this._delete; }
}
export const httpMethodSymbol = Symbol.for("@nivinjoseph/n-web/httpMethod");
// public
export function httpGet(target, context) {
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "httpGet decorator should only be used on a class");
    const className = context.name;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with httpGet must extend Controller class`);
    context.metadata[httpMethodSymbol] = HttpMethods.Get;
}
// public
export function httpPost(target, context) {
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "httpPost decorator should only be used on a class");
    const className = context.name;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with httpPost must extend Controller class`);
    context.metadata[httpMethodSymbol] = HttpMethods.Post;
}
// public
export function httpPut(target, context) {
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "httpPut decorator should only be used on a class");
    const className = context.name;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with httpPut must extend Controller class`);
    context.metadata[httpMethodSymbol] = HttpMethods.Put;
}
// public
export function httpDelete(target, context) {
    given(context, "context")
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .ensure(t => t.kind === "class", "httpDelete decorator should only be used on a class");
    const className = context.name;
    given(className, className).ensureHasValue().ensureIsString()
        .ensure(_ => target.prototype instanceof Controller, `class '${className}' decorated with httpDelete must extend Controller class`);
    context.metadata[httpMethodSymbol] = HttpMethods.Delete;
}
//# sourceMappingURL=http-method.js.map