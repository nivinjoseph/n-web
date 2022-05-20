"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmrHelper = void 0;
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const memfs_1 = require("memfs");
const path = require("path");
const mkdirp = require("mkdirp");
class HmrHelper {
    /**
     * @static
     */
    constructor() { }
    static get devFs() {
        (0, n_defensive_1.given)(this, "this").ensure(_ => HmrHelper._devFs != null, "not configured");
        return this._devFs;
    }
    static get outputPath() {
        (0, n_defensive_1.given)(this, "this").ensure(_ => HmrHelper._outputPath != null, "not configured");
        return this._outputPath;
    }
    static get isConfigured() { return this._devFs != null && this._outputPath != null; }
    static configure() {
        const devFs = (0, memfs_1.createFsFromVolume)(new memfs_1.Volume());
        devFs.join = path.join.bind(path);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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