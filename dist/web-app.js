"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Koa = require("koa");
var KoaBodyParser = require("koa-bodyparser");
var n_ject_1 = require("n-ject");
var n_defensive_1 = require("n-defensive");
var router_1 = require("./router");
// public
var WebApp = (function () {
    function WebApp(port) {
        n_defensive_1.given(port, "port").ensureHasValue();
        this._port = port;
        this._koa = new Koa();
        this._container = new n_ject_1.Container();
        this._router = new router_1.Router(this._koa, this._container);
    }
    WebApp.prototype.registerControllers = function () {
        var controllers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            controllers[_i] = arguments[_i];
        }
        (_a = this._router).registerControllers.apply(_a, controllers);
        return this;
        var _a;
    };
    WebApp.prototype.registerInstaller = function (installer) {
        n_defensive_1.given(installer, "installer").ensureHasValue();
        this._container.install(installer);
        return this;
    };
    WebApp.prototype.bootstrap = function () {
        this.configureContainer();
        this.configureScoping();
        this.configureBodyParser();
        this.configureRouting(); // must be last
        this._koa.listen(this._port);
    };
    WebApp.prototype.configureContainer = function () {
        this._container.bootstrap();
    };
    WebApp.prototype.configureScoping = function () {
        var _this = this;
        this._koa.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx.state.scope = this._container.createScope();
                        return [4 /*yield*/, next()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    WebApp.prototype.configureBodyParser = function () {
        this._koa.use(KoaBodyParser({ strict: true }));
    };
    WebApp.prototype.configureRouting = function () {
        this._router.configureRouting();
    };
    return WebApp;
}());
exports.WebApp = WebApp;
//# sourceMappingURL=web-app.js.map