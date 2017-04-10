import "n-ext";
import { given } from "n-defensive";
import { Route } from "./route";

// public
export abstract class Controller
{
    public abstract execute(...params: any[]): Promise<any>;
    
    protected generateUrl(route: string, params: any): string;
    protected generateUrl(route: string, params: any, baseUrl: string): string;
    protected generateUrl(route: string, params: any, baseUrl?: string): string
    {
        given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        route = route.trim();
        if (baseUrl !== undefined && baseUrl != null)
        {
            baseUrl = baseUrl.trim();
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            
            route = baseUrl + route;
        }    
        
        if (params == null)
            return route;
        
        return new Route(route).generateUrl(params);
    }
}