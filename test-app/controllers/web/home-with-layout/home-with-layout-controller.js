"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./../../../../src/index");
const routes = require("./../../routes");
let HomeWithLayoutController = class HomeWithLayoutController extends index_1.Controller {
    execute() {
        return Promise.resolve({ part1: "Hello from home", part2: "with layout" });
    }
};
HomeWithLayoutController = __decorate([
    index_1.httpGet,
    index_1.route(routes.homeWithLayout),
    index_1.view("home-with-layout-view.html"),
    index_1.viewLayout("layout.html")
], HomeWithLayoutController);
exports.HomeWithLayoutController = HomeWithLayoutController;
//# sourceMappingURL=home-with-layout-controller.js.map