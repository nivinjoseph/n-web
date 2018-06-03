import "reflect-metadata";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";


export const eventSymbol = Symbol("event");

// public
export function event(event: string): Function
{
    given(event, "event").ensureHasValue()
        .ensure(t => !t.isEmptyOrWhiteSpace(), "cannot be empty or whitespace");

    return (target: Function) => Reflect.defineMetadata(eventSymbol, event.trim(), target);
}