import { Exception } from "n-exception";
import "n-ext";
export declare class HttpRedirectException extends Exception {
    private readonly _url;
    readonly url: string;
    constructor(url: string);
}
