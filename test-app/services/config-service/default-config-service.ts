import { ConfigurationManager } from "@nivinjoseph/n-config";
import { type ConfigService } from "./config-service.js";

export class DefaultConfigService implements ConfigService
{
    public getBaseUrl(): Promise<string>
    {
        const value = ConfigurationManager.getConfig<string>("baseUrl");
        return Promise.resolve(value);
    }
}