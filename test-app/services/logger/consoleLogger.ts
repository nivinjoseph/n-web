import { Logger } from "./logger";
import { Exception } from "@nivinjoseph/n-exception";


export class ConsoleLogger implements Logger
{
    public logInfo(info: string): Promise<void>
    {
        console.log(`INFO: ${info}`);
        return Promise.resolve();
    }
    
    public logWarning(warning: string): Promise<void>
    {
        console.log(`INFO: ${warning}`);
        return Promise.resolve();
    }
    
    public logError(error: string | Exception): Promise<void>
    {
        console.log(`ERROR: ${error.toString()}`);
        return Promise.resolve();
    }
}