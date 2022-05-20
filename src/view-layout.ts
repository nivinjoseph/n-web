import "reflect-metadata";
import { given } from "@nivinjoseph/n-defensive";

export const viewLayoutSymbol = Symbol.for("@nivinjoseph/n-web/viewLayout");

// public
export function viewLayout(file: string): Function
{
    given(file, "file").ensureHasValue().ensureIsString();

    return (target: Function) => Reflect.defineMetadata(viewLayoutSymbol, file.trim(), target);
}
