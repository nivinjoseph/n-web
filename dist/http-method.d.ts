import "reflect-metadata";
export declare class HttpMethods {
    private static readonly _get;
    private static readonly _post;
    private static readonly _put;
    private static readonly _delete;
    static get Get(): string;
    static get Post(): string;
    static get Put(): string;
    static get Delete(): string;
}
export declare const httpMethodSymbol: unique symbol;
export declare function httpGet(target: Function): void;
export declare function httpPost(target: Function): void;
export declare function httpPut(target: Function): void;
export declare function httpDelete(target: Function): void;
