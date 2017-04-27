import { ConfigService } from "./config-service";
import { ConfigurationManager } from "n-config";

export class DefaultConfigService implements ConfigService
{
    getBaseUrl(): Promise<string>
    {
        let value = ConfigurationManager.getConfig<string>("baseUrl");
        return Promise.resolve(value);
    }
}