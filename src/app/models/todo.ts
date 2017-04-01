export class Todo
{
    private readonly _id: number;
    private readonly _title: string;
    private readonly _description: string;
    
    
    public get id(): number { return this._id; }
    public get title(): string { return this._title; }
    public get description(): string { return this._description; }
    
    
    public constructor(id: number, title: string, description: string)
    {
        this._id = id;
        this._title = title;
        this._description = description;
    }
}