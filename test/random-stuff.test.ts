import * as assert from "assert";
import "n-ext";

suite("Random stuff", () =>
{
    test("Dynamic template string interpolation", () =>
    {
        let vm = { firstName: "Nivin", lastName: "Joseph", age: 31 };
        let view = "User ${vm.firstName} ${vm.lastName} is of age ${vm.age}";
        let result = eval("`" + view + "`");
        assert.strictEqual(result, "User Nivin Joseph is of age 31");
    });
    
    test("Advanced dynamic template string interpolation", () =>
    {
        let vm = { firstName: "Nivin", lastName: "Joseph", age: 31 };
        let view = "is of age ${vm.age}";
        let layout = "User ${vm.firstName} ${vm.lastName} ${view}";
        view = eval("`" + layout + "`");
        let result = eval("`" + view + "`");
        assert.strictEqual(result, "User Nivin Joseph is of age 31");
    });
    
    test("object keys", () =>
    {
        let query: any = { foo: "bar" };
        for (let key in query)
        {
            console.log("key", key);
            console.log("value", query[key]);
        }    
    });
    
    test("Object keys", () =>
    {
        let query = new Object();
        query.setValue("foo", "bar");
        
        for (let key in query)
        {
            console.log("key", key);
            console.log("value", query.getValue(key));
        }
    });
});