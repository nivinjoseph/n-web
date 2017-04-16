import { Exception } from "n-exception";
import "n-ext";
import { given } from "n-defensive";

export class HttpRedirectException extends Exception
{
    private readonly _url: string;
    
    
    public get url(): string { return this._url; }
    
    
    public constructor(url: string)
    {
        given(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        super(null);
        this._url = url;
    }
}    

