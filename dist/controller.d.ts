export declare abstract class Controller {
    abstract execute(...params: Array<any>): Promise<any>;
    protected redirect(url: string): void;
    protected disableCompression(): void;
}
//# sourceMappingURL=controller.d.ts.map