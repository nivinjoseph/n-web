import { TodoManager } from "./../../services/todo-manager/todo-manager";
import { given } from "@nivinjoseph/n-defensive";
import { command, httpPost, route, Controller, HttpException, Utils, EventAggregator } from "./../../../src/index";
import * as Routes from "./../routes";
import { ConfigService } from "./../../services/config-service/config-service";
import { inject } from "@nivinjoseph/n-ject";
import { Validator, strval } from "@nivinjoseph/n-validate";
import { Event } from "./../../events/event";

@command
@route(Routes.createTodo)
@inject("TodoManager", "ConfigService", "EventAggregator")    
export class CreateTodoController extends Controller
{
    private readonly _todoManager: TodoManager;
    private readonly _configService: ConfigService;
    private readonly _eventAggregator: EventAggregator;
    
    
    public constructor(todoManager: TodoManager, configService: ConfigService, eventAggregator: EventAggregator)
    {
        given(todoManager, "todoManager").ensureHasValue();
        given(configService, "configService").ensureHasValue();
        given(eventAggregator, "eventAggregator").ensureHasValue().ensureIsObject();
        super();
        this._todoManager = todoManager;
        this._configService = configService;
        this._eventAggregator = eventAggregator;
    }
    
    
    public async execute(model: Model): Promise<any>
    {
        this.validateModel(model);   
        
        let todo = await this._todoManager.addTodo(model.title, model.description);
        await this._eventAggregator.publish(Event.todoCreated, todo.id);
        
        let baseUrl = await this._configService.getBaseUrl();
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