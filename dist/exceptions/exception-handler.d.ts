import { Exception } from "@nivinjoseph/n-exception";
export declare abstract class ExceptionHandler {
    abstract handle(exp: Exception): Promise<any>;
}
