import "reflect-metadata";
import { given } from "n-defensive";
import "n-ext";


export const viewSymbol = Symbol("webView");

// public
export function view(file: string): Function
{
    given(file, "file")
        .ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace())
        .ensure(t => t.trim().endsWith(".html"), "not a .html file");

    return (target: Function) => Reflect.defineMetadata(viewSymbol, file.trim(), target);
}

