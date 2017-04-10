import "n-ext";
export declare abstract class Controller {
    abstract execute(...params: any[]): Promise<any>;
    protected generateUrl(route: string, params: any): string;
    protected generateUrl(route: string, params: any, baseUrl: string): string;
}
