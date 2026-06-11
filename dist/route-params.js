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
export {};
//# sourceMappingURL=route-params.js.map