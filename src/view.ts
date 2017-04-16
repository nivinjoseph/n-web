import "reflect-metadata";
import { given } from "n-defensive";
import "n-ext";

export const viewSymbol = Symbol("view");

// public
export function view(filePath: string): Function
{
    given(filePath, "filePath").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

    return (target: Function) => Reflect.defineMetadata(viewSymbol, filePath, target);
}

