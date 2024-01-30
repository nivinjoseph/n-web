import { given } from "@nivinjoseph/n-defensive";
import type { ClassDefinition } from "@nivinjoseph/n-util";
import { HttpRedirectException } from "./exceptions/http-redirect-exception.js";

// public
export abstract class Controller
{
    public abstract execute(...params: Array<any>): Promise<any>;
    
    
    // protected generateUrl(route: string, params?: object, baseUrl?: string): string
    // {
    //     return Utils.generateUrl(route, params, baseUrl);
    // }
    
    protected redirect(url: string): void
    {
        given(url, "url").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        throw new HttpRedirectException(url.trim());
    }
    
    protected disableCompression(): void
    {
        given(this, "this").ensure(t => (<any>t).__ctx != null, "cannot invoke method before context is set");
        
        (<any>this).__ctx.compress = false;
    }
}


export type ControllerClass<This extends Controller> = ClassDefinition<This>;
