type RouteTypeMap = {
    string: string;
    number: number;
    boolean: boolean;
    any: any;
};
type ResolveRouteType<T extends string> = T extends keyof RouteTypeMap ? RouteTypeMap[T] : any;
type TrimRoute<S extends string> = S extends ` ${infer R}` ? TrimRoute<R> : S extends `${infer L} ` ? TrimRoute<L> : S;
type RequiredParams<S extends string> = S extends `${string}{${infer Body}}${infer Rest}` ? Body extends `${string}?:${string}` ? RequiredParams<Rest> : Body extends `${infer K}:${infer T}` ? {
    [P in TrimRoute<K>]: ResolveRouteType<Lowercase<TrimRoute<T>>>;
} & RequiredParams<Rest> : RequiredParams<Rest> : unknown;
type OptionalParams<S extends string> = S extends `${string}{${infer Body}}${infer Rest}` ? Body extends `${infer K}?:${infer T}` ? {
    [P in TrimRoute<K>]?: ResolveRouteType<Lowercase<TrimRoute<T>>> | null;
} & OptionalParams<Rest> : OptionalParams<Rest> : unknown;
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
/**
 * Extracts a typed params object from a route template literal.
 *
 * @example
 * RouteParams<"/api/Todo/{id: number}">
 *   // -> { id: number }
 * RouteParams<"/api/Todos?{$search?: string}&{$pageSize?: number}">
 *   // -> { $search?: string | null; $pageSize?: number | null }
 */
export type ControllerRouteParams<S extends string> = Prettify<RequiredParams<S> & OptionalParams<S>>;
type ControllerInstance<T> = T extends abstract new (...args: Array<any>) => infer TInstance ? TInstance : T;
/**
 * Resolves a controller (class or instance type) to the route it is declared for, read from the
 * phantom `__route` brand that `QueryController`/`CommandController` carry via their `TRoute` type
 * parameter. Falls back to `string` for controllers that don't declare a specific route.
 */
export type ControllerRoute<T> = ControllerInstance<T> extends {
    readonly __route?: infer TRoute extends string;
} ? TRoute : string;
export {};
//# sourceMappingURL=route-params.d.ts.map