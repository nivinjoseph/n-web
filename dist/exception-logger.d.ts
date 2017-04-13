import { Exception } from "n-exception";
export declare abstract class ExceptionLogger {
    abstract log(exp: Exception): Promise<void>;
}
