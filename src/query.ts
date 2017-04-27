import { httpMethodSymbol, HttpMethods } from "./http-method";


// public
export function query(target: Function): void
{
    Reflect.defineMetadata(httpMethodSymbol, HttpMethods.Get, target);
}