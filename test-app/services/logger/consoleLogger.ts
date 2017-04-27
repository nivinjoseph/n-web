import { Logger } from "./logger";
import { Exception } from "n-exception";
import * as Colors from "colors";


export class ConsoleLogger implements Logger
{
    public logInfo(info: string): Promise<void>
    {
        console.log(Colors.green(`INFO: ${info}`));
        return Promise.resolve();
    }
    
    public logWarning(warning: string): Promise<void>
    {
        console.log(Colors.yellow(`INFO: ${warning}`));
        return Promise.resolve();
    }
    
    public logError(error: string | Exception): Promise<void>
    {
        console.log(Colors.red(`ERROR: ${error.toString()}`));
        return Promise.resolve();
    }
}