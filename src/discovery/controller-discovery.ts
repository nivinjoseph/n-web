import { given } from "@nivinjoseph/n-defensive";
import type { ClassHierarchy } from "@nivinjoseph/n-util";
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
export function discoverControllers(
    directoryUrl: URL
): Promise<Array<ClassHierarchy<Controller>>> 
{
    given(directoryUrl, "directoryUrl").ensureHasValue().ensureIsObject();

    return discoverClasses<ClassHierarchy<Controller>>({
        directoryUrl,
        fileSuffix: "-controller.js",
        classNameSuffix: "Controller",
        kind: "controller",
        isMatch: isControllerClass,
    });
}

function isControllerClass(
    value: unknown
): value is ClassHierarchy<Controller> 
{
    return typeof value === "function" && value.prototype instanceof Controller;
}
