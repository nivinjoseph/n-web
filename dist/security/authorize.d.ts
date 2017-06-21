import "reflect-metadata";
import { Claim } from "n-sec";
export declare const authorizeSymbol: symbol;
export declare function authorize(...claims: Array<Claim>): Function;
