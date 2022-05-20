import { given } from "@nivinjoseph/n-defensive";
import { InvalidArgumentException, ApplicationException, InvalidOperationException } from "@nivinjoseph/n-exception";
import { TypeHelper } from "@nivinjoseph/n-util";
import { HttpException } from "./exceptions/http-exception";

export class RouteParam
{
    private readonly _param: string;
    private readonly _paramKey: string;
    private readonly _paramType: string;
    private readonly _isQuery: boolean;
    private readonly _isOptional: boolean;
    private _order = 0;
    
    
    public get param(): string { return this._param; }
    public get paramKey(): string { return this._paramKey; }
    public get paramType(): string { return this._paramType; }
    public get isQuery(): boolean { return this._isQuery; }
    public get isOptional(): boolean { return this._isOptional; }
    public get order(): number { return this._order; }

    
    public constructor(routeParam: string)
    {
        given(routeParam, "routeParam").ensureHasValue().ensureIsString();
        
        let param = routeParam.trim();
        let paramKey: string;
        let paramType: string;
        let isQuery = false;
        let isOptional = false;
        
        if (param.endsWith("[Q]"))
        {
            isQuery = true;
            param = param.replace("[Q]", "");
        } 
        
        if (param.contains(":"))
        {
            const splitted = param.split(":");
            if (splitted.length > 2 || splitted[0].isEmptyOrWhiteSpace() || splitted[1].isEmptyOrWhiteSpace())
                throw new InvalidArgumentException("routeParam");
            
            paramKey = splitted[0].trim();
            paramType = splitted[1].trim().toLowerCase();
            
            if (paramType !== ParamTypes.boolean && paramType !== ParamTypes.number && paramType !== ParamTypes.string)
                paramType = ParamTypes.any;    
        }
        else
        {
            paramKey = param;
            paramType = ParamTypes.any;
        }    
        
        if (paramKey.endsWith("?"))
        {
            if (!isQuery)
                throw new ApplicationException("Path parameters cannot be optional.");
            
            paramKey = paramKey.substr(0, paramKey.length - 1);
            isOptional = true;
        }    
        
        this._param = param;
        this._paramKey = paramKey;
        this._paramType = paramType;
        this._isQuery = isQuery;
        this._isOptional = isOptional;
    }
    
    public setOrder(order: number): void
    {
        given(order, "order").ensureHasValue();
        
        if (this._order > 0)
            throw new InvalidOperationException("setOrder");    
        
        this._order = order;
    }
    
    public parseParam(value: string | null): any
    {
        if (value == null || typeof value !== "string" || value.isEmptyOrWhiteSpace() || value.trim().toLowerCase() === "null")
        { 
            if (this._isOptional)
                return null;
            
            throw new HttpException(404);
        }
        
        value = value.trim();
        
        if (this._paramType === ParamTypes.string || this._paramType === ParamTypes.any)
            return value;
        
        try 
        {
            return this._paramType === ParamTypes.number ? this._parseNumber(value) : this._parseBoolean(value);
        }
        catch (error)
        {
            if (this._isOptional)
                return null;
            
            throw error;
        }
    }
    
    private _parseNumber(value: string): number
    {
        try 
        {
            // const num = value.contains(".") ? Number.parseFloat(value) : Number.parseInt(value);
            // if (!Number.isNaN(num))
            //     return num;    
            
            const num = TypeHelper.parseNumber(value);
            if (num != null)
                return num;
            
            // throw "PARSE ERROR";
            throw new HttpException(404);
        }
        catch (error)
        {
            throw new HttpException(404);
        }
    }
    
    private _parseBoolean(value: string): boolean
    {
        value = value.toLowerCase();
        
        if (value === "true")
            return true;
        
        if (value === "false")
            return false;
        
        throw new HttpException(404);
    }
}

class ParamTypes
{   
    private static readonly _boolean = "boolean";
    private static readonly _number = "number";
    private static readonly _string = "string";
    private static readonly _any = "any";
    
    
    public static get boolean(): string { return this._boolean; }
    public static get number(): string { return this._number; }
    public static get string(): string { return this._string; }
    public static get any(): string { return this._any; }
}