import { Exception } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
export declare class HttpRedirectException extends Exception {
    private readonly _url;
    get url(): string;
    constructor(url: string);
}
