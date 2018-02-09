import { Exception } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import { given } from "@nivinjoseph/n-defensive";

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

