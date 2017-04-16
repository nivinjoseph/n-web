import "reflect-metadata";
import { given } from "n-defensive";
import "n-ext";

export const viewLayoutSymbol = Symbol("viewLayout");

// public
export function viewLayout(filePath: string): Function
{
    given(filePath, "filePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

    return (target: Function) => Reflect.defineMetadata(viewLayoutSymbol, filePath, target);
}
