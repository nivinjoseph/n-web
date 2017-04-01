export abstract class Controller<TModel, TResult>
{
    public abstract execute(model: TModel): Promise<TResult>;
}