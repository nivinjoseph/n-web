import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { Validator, strval } from "@nivinjoseph/n-validate";
import { Controller, HttpException, Utils, httpPut, route } from "./../../../src/index.js";
import { type ConfigService } from "./../../services/config-service/config-service.js";
import { type TodoManager } from "./../../services/todo-manager/todo-manager.js";
import * as Routes from "./../routes.js";

@httpPut
@route(Routes.updateTodo) 
@inject("TodoManager", "ConfigService")    
export class UpdateTodoController extends Controller
{
    private readonly _todoManager: TodoManager;
    private readonly _configService: ConfigService;
    
    
    public constructor(todoManager: TodoManager, configService: ConfigService)
    {
        given(todoManager, "todoManager").ensureHasValue();
        given(configService, "configService").ensureHasValue();
        super();
        this._todoManager = todoManager;
        this._configService = configService;
    }
    
    
    public async execute(id: number, model: Model): Promise<any>
    {
        this._validateModel(model);
        
        const todo = await this._todoManager.updateTodo(id, model.title, model.description);
        
        const baseUrl = await this._configService.getBaseUrl();
        return {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            links: {
                self: Utils.generateUrl(Routes.getTodo, { id: todo.id }, baseUrl),
                update: Utils.generateUrl(Routes.updateTodo, { id: todo.id }, baseUrl),
                delete: Utils.generateUrl(Routes.deleteTodo, { id: todo.id }, baseUrl)
            }
        };
    }
    
    private _validateModel(model: Model): void
    {
        const validator = new Validator<Model>();
        validator.prop("title").isRequired().useValidationRule(strval.hasMaxLength(10));
        validator.prop("description").isOptional().useValidationRule(strval.hasMaxLength(100));

        validator.validate(model);
        if (validator.hasErrors)
            throw new HttpException(400, validator.errors);
    }
}

interface Model
{
    title: string;
    description: string;
}