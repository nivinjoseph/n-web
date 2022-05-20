import * as assert from "assert";
import "@nivinjoseph/n-ext";

suite("Random stuff", () =>
{
    test("Dynamic template string interpolation", () =>
    {
        // @ts-expect-error: used in eval
        const vm = { firstName: "Nivin", lastName: "Joseph", age: 31 };
        const view = "User ${vm.firstName} ${vm.lastName} is of age ${vm.age}";
        // eslint-disable-next-line no-eval
        const result = eval("`" + view + "`");
        assert.strictEqual(result, "User Nivin Joseph is of age 31");
    });
    
    test("Advanced dynamic template string interpolation", () =>
    {
        // @ts-expect-error: used in eval
        const vm = { firstName: "Nivin", lastName: "Joseph", age: 31 };
        let view = "is of age ${vm.age}";
        const layout = "User ${vm.firstName} ${vm.lastName} ${view}";
        // eslint-disable-next-line no-eval
        view = eval("`" + layout + "`");
        // eslint-disable-next-line no-eval
        const result = eval("`" + view + "`");
        assert.strictEqual(result, "User Nivin Joseph is of age 31");
    });
    
    test("object keys", () =>
    {
        const query: any = { foo: "bar" };
        for (const key in query)
        {
            console.log("key", key);
            console.log("value", query[key]);
        }    
    });
    
    test("Object keys", () =>
    {
        const query = new Object();
        query.setValue("foo", "bar");
        
        for (const key in query)
        {
            console.log("key", key);
            console.log("value", query.getValue(key));
        }
    });
});