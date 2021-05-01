import "@nivinjoseph/n-ext";
export declare class RouteParam {
    private readonly _param;
    private readonly _paramKey;
    private readonly _paramType;
    private readonly _isQuery;
    private readonly _isOptional;
    private _order;
    get param(): string;
    get paramKey(): string;
    get paramType(): string;
    get isQuery(): boolean;
    get isOptional(): boolean;
    get order(): number;
    constructor(routeParam: string);
    setOrder(order: number): void;
    parseParam(value: string): any;
    private parseNumber;
    private parseBoolean;
}
