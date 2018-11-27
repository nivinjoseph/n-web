import "reflect-metadata";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";


export const eventSymbol = Symbol("eventName");

// public
export function event(eventType: Function): Function
{
    given(eventType, "eventType").ensureHasValue().ensureIsFunction();

    return (target: Function) => Reflect.defineMetadata(eventSymbol, (<Object>eventType).getTypeName(), target);
}