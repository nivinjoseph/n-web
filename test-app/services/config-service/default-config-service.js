"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const n_config_1 = require("n-config");
class DefaultConfigService {
    getBaseUrl() {
        let value = n_config_1.ConfigurationManager.getConfig("baseUrl");
        return Promise.resolve(value);
    }
}
exports.DefaultConfigService = DefaultConfigService;
//# sourceMappingURL=default-config-service.js.map