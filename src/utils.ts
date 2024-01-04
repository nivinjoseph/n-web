import { RouteInfo } from "./route-info.js";
import { given } from "@nivinjoseph/n-defensive";


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

        route = route.trim().replaceAll(" ", "");

        if (baseUrl != null && baseUrl.isNotEmptyOrWhiteSpace())
        {
            baseUrl = baseUrl.trim().replaceAll(" ", "");
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);

            if (route.startsWith("/"))
                route = route.substr(1, route.length - 1);

            // special treatment for the sake of docker routing on ECS
            const splittedBaseUrl = baseUrl.split("/");
            const popped = splittedBaseUrl.pop()?.toLowerCase();
            if (popped != null && route.toLowerCase().startsWith(popped))
                baseUrl = splittedBaseUrl.join("/");

            route = baseUrl + "/" + route;
        }

        return params ? new RouteInfo(route, true).generateUrl(params) : route;
    }
}