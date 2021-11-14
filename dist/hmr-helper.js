"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmrHelper = void 0;
const memfs_1 = require("memfs");
const path = require("path");
class HmrHelper {
    /**
     * @static
     */
    constructor() { }
    static get devFs() { return this._devFs; }
    static get outputPath() { return this._outputPath; }
    static configure() {
        const devFs = memfs_1.fs;
        devFs.join = path.join.bind(path); // no need to bind
        this._devFs = devFs;
        const config = require(path.join(process.cwd(), "webpack.config.js"));
        this._outputPath = config.output.path;
    }
}
exports.HmrHelper = HmrHelper;
HmrHelper._devFs = null;
HmrHelper._outputPath = null;
//# sourceMappingURL=hmr-helper.js.map