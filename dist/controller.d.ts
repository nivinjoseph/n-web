import "@nivinjoseph/n-ext";
export declare abstract class Controller {
    abstract execute(...params: any[]): Promise<any>;
    protected redirect(url: string): void;
}
