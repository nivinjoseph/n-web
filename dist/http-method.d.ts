import "reflect-metadata";
export declare class HttpMethods {
    private static readonly _get;
    private static readonly _post;
    private static readonly _put;
    private static readonly _delete;
    static readonly Get: string;
    static readonly Post: string;
    static readonly Put: string;
    static readonly Delete: string;
}
export declare const httpMethodSymbol: unique symbol;
export declare function httpGet(target: Function): void;
export declare function httpPost(target: Function): void;
export declare function httpPut(target: Function): void;
export declare function httpDelete(target: Function): void;
