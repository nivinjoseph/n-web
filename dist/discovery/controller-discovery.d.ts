import type { ClassHierarchy } from "@nivinjoseph/n-util";
import { Controller } from "@nivinjoseph/n-web";
/**
 * Discovers n-web controllers under the given directory — the app's own
 * `new URL("./controllers", import.meta.url)`. Spread the result into
 * `WebApp.registerControllers(...)`.
 *
 * Contract: file `<name>-controller.ts` (emitted `-controller.js`) exporting a
 * class named `<Pascal>Controller` that extends `Controller` (directly or via
 * `QueryController`/`CommandController`). A `_` name prefix opts out.
 */
export declare function discoverControllers(directoryUrl: URL): Promise<Array<ClassHierarchy<Controller>>>;
//# sourceMappingURL=controller-discovery.d.ts.map