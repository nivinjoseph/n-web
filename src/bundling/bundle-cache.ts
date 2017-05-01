import { given } from "n-defensive";

export class BundleCache
{
    private static _cache: { [index: string]: string } = {};
    
    
    public static find(key: string): string
    {
        given(key, "key").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        
        key = key.trim();
        
        if (BundleCache._cache[key])
            return BundleCache._cache[key];
        
        return null;
    }
    
    public static add(key: string, value: string): void
    {
        given(key, "key").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        key = key.trim();
        
        BundleCache._cache[key] = value;
    }
}