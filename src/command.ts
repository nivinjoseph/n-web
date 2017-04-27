import { httpMethodSymbol, HttpMethods } from "./http-method";


// public
export function command(target: Function): void
{
    Reflect.defineMetadata(httpMethodSymbol, HttpMethods.Post, target);
}
