import { TodoManager } from "./../../services/todo-manager/todo-manager";
import { given } from "n-defensive";
import { command, httpPost, route, Controller, HttpException } from "./../../../src/index";
import * as Routes from "./../routes";
import { ConfigService } from "./../../services/config-service/config-service";
import { inject } from "n-ject";
import { Validator, strval } from "n-validate";

@command
@route(Routes.createTodo)
@inject("TodoManager", "ConfigService")    
export class CreateTodoController extends Controller
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
    
    
    public async execute(model: Model): Promise<any>
    {
        this.validateModel(model);   
        
        let todo = await this._todoManager.addTodo(model.title, model.description);
        
        let baseUrl = await this._configService.getBaseUrl();
        return {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            links: {
                self: this.generateUrl(Routes.getTodo, { id: todo.id }, baseUrl),
                update: this.generateUrl(Routes.updateTodo, { id: todo.id }, baseUrl),
                delete: this.generateUrl(Routes.deleteTodo, { id: todo.id }, baseUrl)
            }
        };
    }
    
    private validateModel(model: Model): void
    {
        let validator = new Validator<Model>();
        validator.for<string>("title").isRequired().useValidationRule(strval.hasMaxLength(10));
        validator.for<string>("description").isOptional().useValidationRule(strval.hasMaxLength(100));
        
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