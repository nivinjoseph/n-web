import { given } from "@nivinjoseph/n-defensive";
import { Exception } from "@nivinjoseph/n-exception";

export class HttpRedirectException extends Exception
{
    private readonly _url: string;
    
    
    public get url(): string { return this._url; }
    
    
    public constructor(url: string)
    {
        given(url, "url").ensureHasValue().ensureIsString();
        super("HTTP redirect");
        this._url = url;
    }
}    

