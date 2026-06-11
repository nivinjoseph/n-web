// Client-only entry point.
//
// A pure client (e.g. an SDK or a browser app) only needs to build urls from the shared route
// table and to reference the request/response/param contract types. It does NOT need the server
// framework (WebApp, koa, the DI container, controllers, security, etc.).
//
// This entry exposes exactly that surface. The only runtime imports are `Utils` and `RpcClient`,
// whose dependency graph is lightweight (n-defensive / n-exception / n-util / n-ext) — it never
// pulls in koa or the server runtime. Everything else here is a type, so `verbatimModuleSyntax`
// erases those imports entirely at build time. Importing from "@nivinjoseph/n-web/client" therefore
// avoids loading the full framework that "@nivinjoseph/n-web" would.
import "@nivinjoseph/n-ext";
import { Utils } from "./utils.js";
import { RpcClient } from "./rpc-client.js";
import { RpcException } from "./rpc-exception.js";
import {} from "./command-controller.js";
import {} from "./query-controller.js";
import {} from "./route-params.js";
export { RpcClient, RpcException, Utils };
//# sourceMappingURL=index.client.js.map