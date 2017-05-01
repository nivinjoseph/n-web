// import * as fs from "fs";
// import * as path from "path";
// import { given } from "n-defensive";
// import "n-ext";
// import { ArgumentException } from "n-exception";


// let templates: { [index: string]: string } = {};

// // public
// export class ClientViewTemplateBundler
// {
//     private readonly _path: string;
//     private readonly _cache: boolean = false;


//     public constructor(path: string, cache?: boolean)
//     {
//         given(path, "path").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
//         this._path = path.trim();
//         if (cache)
//             this._cache = true;
//     }

//     public render(): string
//     {
//         if (this._cache && templates[this._path])
//             return templates[this._path];

//         let filePath = path.join(process.cwd(), this._path);
//         if (!fs.existsSync(filePath))
//             throw new ArgumentException(`Path [${filePath}]`, "does not exist");

//         if (!filePath.endsWith(".html") && !fs.statSync(filePath).isDirectory())
//             throw new ArgumentException(`Path [${filePath}]`, "is not a .html file or directory");


//         let filesToProcess = new Array<string>();
//         this.accumulateFilesToProcess(filePath, filesToProcess);

//         let result = "";
//         for (let item of filesToProcess)
//         {
//             let fileName = path.basename(item);
//             let id = fileName.replace(".html", "").split("-").join("");
//             let fileContent = fs.readFileSync(item, "utf8");
//             let template = `<script type="text/x-template" id="${id}">${fileContent}</script>`;
//             result = result + template;
//         }

//         if (this._cache)
//             templates[this._path] = result;

//         return result;
//     }

//     private accumulateFilesToProcess(filePath: string, accumulator: Array<string>): void
//     {
//         if (filePath.endsWith(".html"))
//         {
//             accumulator.push(filePath);
//             return;
//         }

//         if (fs.statSync(filePath).isDirectory())
//         {
//             let files = fs.readdirSync(filePath);
//             for (let item of files)
//                 this.accumulateFilesToProcess(path.join(filePath, item), accumulator);
//         }
//     }
// }