import * as assert from "assert";

suite("Random stuff", () =>
{
    test("Dynamic template string interpolation", () =>
    {
        let vm = { firstName: "Nivin", lastName: "Joseph", age: 31 };
        let view = "User ${vm.firstName} ${vm.lastName} is of age ${vm.age}";
        let result = eval("`" + view + "`");
        assert.strictEqual(result, "User Nivin Joseph is of age 31");
    });
});