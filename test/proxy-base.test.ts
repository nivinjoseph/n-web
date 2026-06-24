import "@nivinjoseph/n-ext";
import * as Assert from "assert";
import { describe, test } from "node:test";
import { ProxyBase } from "./../src/proxy-base.js";
import { RpcClient } from "./../src/rpc-client.js";


interface TestDto
{
    name: string;
    age: number;
    nested: { value: number; };
}

// Concrete subclass that surfaces the protected members so they can be exercised.
// The data fields are exposed as computed getters so `copyValue` (which keys off
// `keyof this`) can read them through the instance.
class TestProxy extends ProxyBase<TestDto>
{
    public get name(): string { return this.dto.name; }
    public get age(): number { return this.dto.age; }
    public get nested(): { value: number; } { return this.dto.nested; }

    public get currentDto(): TestDto { return this.dto; }

    public setDto(value: TestDto): void { this.dto = value; }

    public doBackup(): void { this.backupValue(); }

    public doRestore(): void { this.restoreValue(); }

    protected refreshValue(): Promise<void> { return Promise.resolve(); }
}

function createProxy(dto?: TestDto): TestProxy
{
    return new TestProxy(new RpcClient(), dto ?? { name: "a", age: 1, nested: { value: 10 } });
}


await describe("ProxyBase - cloneValue", async () =>
{
    await test("should return a deep clone of the whole dto", () =>
    {
        const dto: TestDto = { name: "a", age: 1, nested: { value: 10 } };
        const proxy = createProxy(dto);

        const clone = proxy.cloneValue();

        Assert.deepStrictEqual(clone, dto);
        Assert.notStrictEqual(clone, proxy.currentDto);
        Assert.notStrictEqual(clone.nested, proxy.currentDto.nested);
    });

    await test("should not affect the dto when the clone is mutated", () =>
    {
        const proxy = createProxy({ name: "a", age: 1, nested: { value: 10 } });

        const clone = proxy.cloneValue();
        clone.name = "changed";
        clone.nested.value = 999;

        Assert.strictEqual(proxy.currentDto.name, "a");
        Assert.strictEqual(proxy.currentDto.nested.value, 10);
    });
});


await describe("ProxyBase - copyValue", async () =>
{
    await test("should return only the requested keys when keys are given", () =>
    {
        const proxy = createProxy({ name: "a", age: 1, nested: { value: 10 } });

        const copy = proxy.copyValue("name", "age");

        Assert.deepStrictEqual(copy, { name: "a", age: 1 });
        Assert.strictEqual(Object.keys(copy).length, 2);
    });

    await test("should deep clone the requested keys", () =>
    {
        const proxy = createProxy({ name: "a", age: 1, nested: { value: 10 } });

        const copy = proxy.copyValue("nested");
        copy.nested.value = 999;

        Assert.strictEqual(proxy.currentDto.nested.value, 10);
    });

    await test("should throw when a method key is requested", () =>
    {
        const proxy = createProxy({ name: "a", age: 1, nested: { value: 10 } });

        Assert.throws(() => proxy.copyValue("setDto" as any));
    });

    await test("should throw when no keys are given", () =>
    {
        const proxy = createProxy({ name: "a", age: 1, nested: { value: 10 } });

        Assert.throws(() => proxy.copyValue());
    });
});


await describe("ProxyBase - backup/restore", async () =>
{
    await test("should restore the dto to the backed up state", () =>
    {
        const proxy = createProxy({ name: "a", age: 1, nested: { value: 10 } });

        proxy.doBackup();
        proxy.setDto({ name: "b", age: 2, nested: { value: 20 } });
        proxy.doRestore();

        Assert.deepStrictEqual(proxy.currentDto, { name: "a", age: 1, nested: { value: 10 } });
    });

    await test("should capture a deep snapshot at backup time", () =>
    {
        const dto: TestDto = { name: "a", age: 1, nested: { value: 10 } };
        const proxy = createProxy(dto);

        proxy.doBackup();
        // mutating the original object after backup must not change the snapshot
        dto.nested.value = 999;
        proxy.setDto({ name: "b", age: 2, nested: { value: 20 } });
        proxy.doRestore();

        Assert.strictEqual(proxy.currentDto.nested.value, 10);
    });

    await test("should support nested backups restored in LIFO order", () =>
    {
        const proxy = createProxy({ name: "a", age: 1, nested: { value: 10 } });

        proxy.doBackup(); // snapshot of "a"
        proxy.setDto({ name: "b", age: 2, nested: { value: 20 } });
        proxy.doBackup(); // snapshot of "b"
        proxy.setDto({ name: "c", age: 3, nested: { value: 30 } });

        proxy.doRestore();
        Assert.strictEqual(proxy.currentDto.name, "b");

        proxy.doRestore();
        Assert.strictEqual(proxy.currentDto.name, "a");
    });

    await test("should warn and leave the dto unchanged when there is no backup to restore", () =>
    {
        const proxy = createProxy({ name: "a", age: 1, nested: { value: 10 } });

        const originalWarn = console.warn;
        let warnCount = 0;
        let warnMessage = "";
        console.warn = (message?: unknown): void =>
        {
            warnCount++;
            warnMessage = String(message);
        };

        try
        {
            proxy.doRestore();
        }
        finally
        {
            console.warn = originalWarn;
        }

        Assert.strictEqual(warnCount, 1);
        Assert.ok(warnMessage.includes("TestProxy"));
        Assert.ok(warnMessage.includes("no backup to restore"));
        Assert.deepStrictEqual(proxy.currentDto, { name: "a", age: 1, nested: { value: 10 } });
    });
});
