import { RouteInfo } from "./route-info";
import { given } from "n-defensive";


// public
export abstract class Utils // static class
{
    public static generateUrl(route: string, params?: object, baseUrl?: string): string
    {
        given(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        if (params)
            given(params, "params").ensureIsObject();
        
        if (baseUrl)
            given(baseUrl, "baseUrl").ensureIsString();    

        route = route.trim();

        if (baseUrl !== undefined && baseUrl != null && !baseUrl.isEmptyOrWhiteSpace())
        {
            baseUrl = baseUrl.trim();
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);

            if (route.startsWith("/"))
                route = route.substr(1, route.length - 1);

            let splittedBaseUrl = baseUrl.split("/");
            if (route.startsWith(splittedBaseUrl.pop()))
                baseUrl = splittedBaseUrl.join("/");

            route = baseUrl + "/" + route;
        }

        return params ? new RouteInfo(route).generateUrl(params) : route.replaceAll(" ", "");
    }
}