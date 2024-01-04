import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { RouteParam } from "./route-param.js";

// route format: /api/Product/{id:number}?{name?:string}&{all:boolean}

export class RouteInfo
{
    private readonly _routeTemplate: string;
    private readonly _routeParams = new Array<RouteParam>();
    private readonly _routeParamsRegistry: Record<string, RouteParam> = {};
    private readonly _koaRoute!: string;
    private readonly _isCatchAll: boolean;
    private _hasQuery = false;


    public get route(): string { return this._routeTemplate; }
    public get koaRoute(): string { return this._koaRoute; }
    public get params(): ReadonlyArray<RouteParam> { return this._routeParams; }
    public get isCatchAll(): boolean { return this._isCatchAll; }


    public constructor(routeTemplate: string, isUrlGenerator = false) // true if used purely for url generation (only by utils)
    {
        given(routeTemplate, "routeTemplate")
            .ensureHasValue()
            .ensure(t => !t.isEmptyOrWhiteSpace());

        routeTemplate = routeTemplate.trim().replaceAll(" ", "");

        if (!isUrlGenerator)
        {
            given(routeTemplate, "routeTemplate")
                .ensure(t => t.startsWith("/"), "has to start with '/'")
                .ensure(t => !t.contains("//"), "cannot contain '//'");

            if (routeTemplate.length > 1 && routeTemplate.endsWith("/"))
                routeTemplate = routeTemplate.substr(0, routeTemplate.length - 1);
        }

        this._routeTemplate = routeTemplate;
        
        if (this._routeTemplate.contains("*"))
        {
            this._isCatchAll = true;
        }   
        else
        {
            this._isCatchAll = false;
            
            this._populateRouteParams();

            if (!isUrlGenerator)
                this._koaRoute = this._generateKoaRoute(this._routeTemplate);
        }
    }


    public findRouteParam(key: string): RouteParam | null
    {
        given(key, "key").ensureHasValue().ensureIsString();
        return this._routeParamsRegistry[key.trim().toLowerCase()];
    }

    public generateUrl(values: Object): string
    {
        let url = this._routeTemplate;
        let hasQuery = this._hasQuery;

        for (const key in values)
        {
            const routeParam = this.findRouteParam(key);
            if (routeParam)
            {
                const param = "{" + routeParam.param + "}";
                const replacement = routeParam.isQuery
                    ? "{0}={1}".format(key, encodeURIComponent(values.getValue(key)))
                    : encodeURIComponent(values.getValue(key));
                url = url.replace(param, replacement);
            }
            else
            {
                url = `${url}${hasQuery ? "&" : "?"}${"{0}={1}".format(key, encodeURIComponent(values.getValue(key)))}`;
                hasQuery = true;
            }
        }

        return url;
    }


    private _populateRouteParams(): void
    {
        let index = 1;
        for (const routeParam of this._extractTemplateParams(this._routeTemplate).map(t => new RouteParam(t)))
        {
            const key = routeParam.paramKey.toLowerCase();
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this._routeParamsRegistry[key])
                throw new ApplicationException("Invalid route template. Duplicate route params (case insensitive) detected.");

            routeParam.setOrder(index++);
            this._routeParamsRegistry[key] = routeParam;
            this._routeParams.push(routeParam);
        }
    }

    private _extractTemplateParams(routeTemplate: string): Array<string>
    {
        const templateParams = new Array<string>();
        let queryFound = false;
        let startFound = false;
        let startIndex = 0;

        for (let i = 0; i < routeTemplate.length; i++)
        {
            if (routeTemplate[i] === "?" && !startFound)
            {
                if (queryFound)
                    throw new ApplicationException("Invalid route template. Unresolvable '?' characters detected.");

                queryFound = true;
            }

            if (routeTemplate[i] === "{")
            {
                if (startFound)
                    throw new ApplicationException("Invalid route template. Braces do not match.");

                startFound = true;
                startIndex = i + 1;
            }
            else if (routeTemplate[i] === "}")
            {
                if (!startFound)
                    throw new ApplicationException("Invalid route template. Braces do not match.");

                let value = routeTemplate.substring(startIndex, i);
                value = value.trim();
                if (queryFound) value = value + "[Q]";
                templateParams.push(value);
                startFound = false;
            }
        }

        this._hasQuery = queryFound;

        return templateParams;
    }

    private _generateKoaRoute(routeTemplate: string): string
    {
        for (const routeParam of this._routeParams)
        {
            const asItWas = "{" + routeParam.param + "}";
            if (!routeTemplate.contains(asItWas))
                throw new ApplicationException("Invalid route template.");

            routeTemplate = routeTemplate.replace(asItWas, ":{0}".format(routeParam.paramKey));
        }

        if (routeTemplate.contains("?"))
        {
            const splitted = routeTemplate.split("?");
            if (splitted.length > 2)
                throw new ApplicationException("Invalid route template. Unresolvable '?' characters detected.");

            routeTemplate = splitted[0];
        }

        return routeTemplate;
    }
}