import * as Assert from "assert";
import { Utils } from "./../src/index.js";
import { describe, test } from "node:test";


await describe("Utils - generateUrl", async () =>
{
    await test("should return a url with given route", () =>
    {
        const url = Utils.generateUrl("/api/test");
        Assert.strictEqual(url, "/api/test");
    });

    await test("should return a url with given route and params", () =>
    {
        const url = Utils.generateUrl("/api/test", { "key": "value" });
        Assert.strictEqual(url, "/api/test?key=value");
    });

    await test("should return a url with given route and baseUrl", () =>
    {
        const url = Utils.generateUrl("/api/test", {}, "http://example.com");
        Assert.strictEqual(url, "http://example.com/api/test");
    });

    await test("should return a url with given route, params, baseUrl", () =>
    {
        const url = Utils.generateUrl("/api/test", { "key": "value" }, "http://example.com");
        Assert.strictEqual(url, "http://example.com/api/test?key=value");
    });

    await test("should return a url with a given route with no slash at the beginning and a baseUrl with no trailing slash", () =>
    {
        const url = Utils.generateUrl("api/test", {}, "http://example.com");
        Assert.strictEqual(url, "http://example.com/api/test");
    });

    await test("should return a url given a route with slash at the beginning and baseUrl with trailing slash", () =>
    {
        const url = Utils.generateUrl("/api/test", {}, "http://example.com/");
        Assert.strictEqual(url, "http://example.com/api/test");
    });
});