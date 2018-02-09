import "@nivinjoseph/n-ext";
import { given } from "@nivinjoseph/n-defensive";
import { RouteInfo } from "./route-info";
import { Utils } from "./utils";
import { HttpRedirectException } from "./exceptions/http-redirect-exception";

// public
export abstract class Controller
{
    public abstract execute(...params: any[]): Promise<any>;
    
    
    // protected generateUrl(route: string, params?: object, baseUrl?: string): string
    // {
    //     return Utils.generateUrl(route, params, baseUrl);
    // }
    
    protected redirect(url: string): void
    {
        given(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        throw new HttpRedirectException(url.trim());
    }
}