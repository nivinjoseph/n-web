import "reflect-metadata";
import { given } from "@nivinjoseph/n-defensive";

export const viewLayoutSymbol = Symbol("viewLayout");

// public
export function viewLayout(file: string): Function
{
    given(file, "file")
        .ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace());

    return (target: Function) => Reflect.defineMetadata(viewLayoutSymbol, file.trim(), target);
}
