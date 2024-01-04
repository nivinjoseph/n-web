import { ConfigService } from "./config-service.js";
import { ConfigurationManager } from "@nivinjoseph/n-config";

export class DefaultConfigService implements ConfigService
{
    public getBaseUrl(): Promise<string>
    {
        const value = ConfigurationManager.getConfig<string>("baseUrl");
        return Promise.resolve(value);
    }
}