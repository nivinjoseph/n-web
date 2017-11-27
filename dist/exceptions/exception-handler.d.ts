import { Exception } from "n-exception";
export declare abstract class ExceptionHandler {
    abstract handle(exp: Exception): Promise<any>;
}
