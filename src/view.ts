import "reflect-metadata";
import { given } from "@nivinjoseph/n-defensive";


export const viewSymbol = Symbol.for("@nivinjoseph/n-web/view");

// public
export function view(file: string): Function
{
    given(file, "file").ensureHasValue().ensureIsString();

    return (target: Function) => Reflect.defineMetadata(viewSymbol, file.trim(), target);
}

