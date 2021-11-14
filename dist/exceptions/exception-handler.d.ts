import { Exception } from "@nivinjoseph/n-exception";
export interface ExceptionHandler {
    handle(exp: Exception): Promise<any>;
}
