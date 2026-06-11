// Type-level parser for route template literals.
//
// Route templates declared as string literals (e.g. "/api/Todo/{id: number}") already
// encode their param names and types. Because the routes are `const` string literals,
// `typeof someRoute` is the literal type, so we can parse it at the type level — mirroring
// the runtime parser in route-param.ts — and derive a typed params object.
//
// Token semantics (matching route-param.ts):
//   {key: type}    -> required path param
//   {$key?: type}  -> optional query param (the leading `$` stays part of the key, and the
//                     trailing `?` before `:` marks it optional)
//   type resolves string/number/boolean to the TS type; anything else falls back to `any`.

type RouteTypeMap = {
    string: string;
    number: number;
    boolean: boolean;
    any: any;
};
type ResolveRouteType<T extends string> = T extends keyof RouteTypeMap ? RouteTypeMap[T] : any;

type TrimRoute<S extends string> =
    S extends ` ${infer R}` ? TrimRoute<R> :
        S extends `${infer L} ` ? TrimRoute<L> :
            S;

// Scan every `{...}` block. Required and optional params are collected in two passes so each
// can be expressed with its own mapped type — a single mapped type cannot conditionally make
// individual keys optional. Intersecting the two passes yields the correct required + optional shape.
type RequiredParams<S extends string> =
    S extends `${string}{${infer Body}}${infer Rest}`
        ? Body extends `${string}?:${string}`
            ? RequiredParams<Rest> // optional -> handled by OptionalParams
            : Body extends `${infer K}:${infer T}`
                ? { [P in TrimRoute<K>]: ResolveRouteType<Lowercase<TrimRoute<T>>> } & RequiredParams<Rest>
                : RequiredParams<Rest>
        : unknown; // identity for `&`

type OptionalParams<S extends string> =
    S extends `${string}{${infer Body}}${infer Rest}`
        ? Body extends `${infer K}?:${infer T}`
            ? { [P in TrimRoute<K>]?: ResolveRouteType<Lowercase<TrimRoute<T>>> | null } & OptionalParams<Rest>
            : OptionalParams<Rest>
        : unknown; // identity for `&`

type Prettify<T> = { [K in keyof T]: T[K] } & {};

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
