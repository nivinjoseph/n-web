import "reflect-metadata";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";


export const eventSymbol = Symbol("eventName");

// public
export function event(event: Function): Function
{
    given(event, "event").ensureHasValue().ensureIsFunction();

    return (target: Function) => Reflect.defineMetadata(eventSymbol, (<Object>event).getTypeName(), target);
}