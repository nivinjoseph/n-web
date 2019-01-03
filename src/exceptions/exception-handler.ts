import { Exception } from "@nivinjoseph/n-exception";

// public
export interface  ExceptionHandler
{
    handle(exp: Exception): Promise<any>;
}