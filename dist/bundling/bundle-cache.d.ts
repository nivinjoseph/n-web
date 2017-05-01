export declare class BundleCache {
    private static _cache;
    static find(key: string): string;
    static add(key: string, value: string): void;
}
