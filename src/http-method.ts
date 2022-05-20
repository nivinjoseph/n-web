import "reflect-metadata";

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
export function httpGet(target: Function): void
{
    Reflect.defineMetadata(httpMethodSymbol, HttpMethods.Get, target);
}

// public
export function httpPost(target: Function): void
{
    Reflect.defineMetadata(httpMethodSymbol, HttpMethods.Post, target);
}

// public
export function httpPut(target: Function): void
{
    Reflect.defineMetadata(httpMethodSymbol, HttpMethods.Put, target);
}

// public
export function httpDelete(target: Function): void
{
    Reflect.defineMetadata(httpMethodSymbol, HttpMethods.Delete, target);
}