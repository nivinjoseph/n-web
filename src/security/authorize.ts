import "reflect-metadata";
import { Claim } from "./claim";


export const authorizeSymbol = Symbol("authorize");

// public
export function authorize(...claims: Array<Claim>): Function
{
    return (target: Function) => Reflect.defineMetadata(authorizeSymbol, claims, target);
}