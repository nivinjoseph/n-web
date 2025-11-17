import { __esDecorate, __runInitializers } from "tslib";
import { Controller } from "../controller.js";
import { query } from "../query.js";
import { route } from "../route.js";
let HealthCheckController = (() => {
    let _classDecorators = [query, route("/healthCheck")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Controller;
    var HealthCheckController = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HealthCheckController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        async execute() {
            return {};
        }
    };
    return HealthCheckController = _classThis;
})();
export { HealthCheckController };
//# sourceMappingURL=health-check-controller.js.map