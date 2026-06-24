import { given } from "@nivinjoseph/n-defensive";
// ProxyBase and RpcClient come from the client-only entry point — never the full server framework.
import { ProxyBase, type RpcClient } from "./../../src/index.client.js";
import { Routes, type GetTodoEndpoint, type GetTodoRes } from "../controllers/sdk-contract.js";


// A live, observable handle to a single todo. Reads flow through getters that project the backing
// DTO; `refresh()` re-fetches the todo by id and swaps the whole DTO in. The base tracks the DTO by
// reference (`observable.ref`), so reactions that read these getters re-run on refresh. Snapshotting
// (`cloneValue` / `copyValue`) and optimistic-edit rollback (`backupValue` / `restoreValue`) are
// inherited from ProxyBase.
export class TodoProxy extends ProxyBase<GetTodoRes>
{
    private readonly _id: number;


    public get id(): number { return this.dto.id; }
    public get title(): string { return this.dto.title; }
    public get description(): string { return this.dto.description; }
    public get links(): GetTodoRes["links"] { return this.dto.links; }


    public constructor(rpcClient: RpcClient, id: number, dto?: GetTodoRes)
    {
        given(rpcClient, "rpcClient").ensureHasValue().ensureIsObject();
        given(id, "id").ensureHasValue().ensureIsNumber();
        super(rpcClient, dto);
        this._id = id;
    }


    // Public trigger for the protected re-fetch hook.
    public refresh(): Promise<void>
    {
        return this.refreshValue();
    }


    protected override async refreshValue(): Promise<void>
    {
        this.dto = await this.rpcClient.query<GetTodoEndpoint>(Routes.query.getTodo, { id: this._id });
    }
}
