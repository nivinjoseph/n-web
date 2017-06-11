import "reflect-metadata";
import { Claim } from "./claim";
export declare const authorizeSymbol: symbol;
export declare function authorize(...claims: Array<Claim>): Function;
