// import { given } from "@nivinjoseph/n-defensive";
// import { IFs, createFsFromVolume, Volume } from "memfs";
// import path from "node:path";
// import { WebpackDevMiddlewareConfig } from "./webpack-dev-middleware-config.js";
// // const mkdirp = require("mkdirp");
// import { mkdirp } from "mkdirp";


// export class HmrHelper
// {
//     private static _devFs: IFs | null = null;
//     private static _outputPath: string | null = null;


//     public static get devFs(): IFs
//     {
//         given(this, "this").ensure(_ => HmrHelper._devFs != null, "not configured");
//         return this._devFs!;
//     }
//     public static get outputPath(): string
//     {
//         given(this, "this").ensure(_ => HmrHelper._outputPath != null, "not configured");
//         return this._outputPath!;
//     }

//     public static get isConfigured(): boolean { return this._devFs != null && this._outputPath != null; }


//     /**
//      * @static
//      */
//     private constructor() { }


//     public static configure(config: WebpackDevMiddlewareConfig): void
//     {
//         given(config, "config").ensureHasValue().ensureIsObject();

//         const devFs: any = createFsFromVolume(new Volume());
//         devFs.join = path.join.bind(path);
//         devFs.mkdirp = mkdirp.bind(mkdirp);
//         this._devFs = devFs;

//         const webpackConfig = require(config.webpackConfigPath!);
//         this._outputPath = webpackConfig.output.path;
//     }
// }