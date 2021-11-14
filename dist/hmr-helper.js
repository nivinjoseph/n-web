"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmrHelper = void 0;
const memfs_1 = require("memfs");
const path = require("path");
const mkdirp = require("mkdirp");
class HmrHelper {
    /**
     * @static
     */
    constructor() { }
    static get devFs() { return this._devFs; }
    static get outputPath() { return this._outputPath; }
    static configure() {
        const devFs = (0, memfs_1.createFsFromVolume)(new memfs_1.Volume());
        devFs.join = path.join.bind(path);
        devFs.mkdirp = mkdirp.bind(mkdirp);
        this._devFs = devFs;
        const config = require(path.join(process.cwd(), "webpack.config.js"));
        this._outputPath = config.output.path;
    }
}
exports.HmrHelper = HmrHelper;
HmrHelper._devFs = null;
HmrHelper._outputPath = null;
//# sourceMappingURL=hmr-helper.js.map