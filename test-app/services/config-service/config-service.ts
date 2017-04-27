export interface ConfigService
{
    getBaseUrl(): Promise<string>;
}