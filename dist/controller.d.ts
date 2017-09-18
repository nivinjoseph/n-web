import "n-ext";
export declare abstract class Controller {
    abstract execute(...params: any[]): Promise<any>;
    protected generateUrl(route: string, params?: object, baseUrl?: string): string;
    protected redirect(url: string): void;
}
