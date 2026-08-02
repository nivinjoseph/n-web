import { given } from "@nivinjoseph/n-defensive";
import { Controller } from "@nivinjoseph/n-web";
import { discoverClasses } from "./module-discovery.js";
/**
 * Discovers n-web controllers under the given directory — the app's own
 * `new URL("./controllers", import.meta.url)`. Spread the result into
 * `WebApp.registerControllers(...)`.
 *
 * Contract: file `<name>-controller.ts` (emitted `-controller.js`) exporting a
 * class named `<Pascal>Controller` that extends `Controller` (directly or via
 * `QueryController`/`CommandController`). A `_` name prefix opts out.
 */
export function discoverControllers(directoryUrl) {
    given(directoryUrl, "directoryUrl").ensureHasValue().ensureIsObject();
    return discoverClasses({
        directoryUrl,
        fileSuffix: "-controller.js",
        classNameSuffix: "Controller",
        kind: "controller",
        isMatch: isControllerClass,
    });
}
function isControllerClass(value) {
    return typeof value === "function" && value.prototype instanceof Controller;
}
//# sourceMappingURL=controller-discovery.js.map