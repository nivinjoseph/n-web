import "reflect-metadata";
import { Claim } from "n-sec";


export const authorizeSymbol = Symbol("authorize");

// public
export function authorize(...claims: Array<Claim>): Function
{
    return (target: Function) => Reflect.defineMetadata(authorizeSymbol, claims, target);
}