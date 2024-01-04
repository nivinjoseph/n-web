import { TodoManager } from "./../../services/todo-manager/todo-manager.js";
import { given } from "@nivinjoseph/n-defensive";
import { command, route, Controller, HttpException, Utils, authorize } from "./../../../src/index.js";
import * as Routes from "./../routes.js";
import { ConfigService } from "./../../services/config-service/config-service.js";
import { inject } from "@nivinjoseph/n-ject";
import { Validator, strval } from "@nivinjoseph/n-validate";
import { AppClaims } from "../../security/app-claims.js";
// import { TodoCreated } from "../../events/todo-created";
// import { EventBus } from "@nivinjoseph/n-eda";


@command
@route(Routes.createTodo)
@authorize(AppClaims.claim1)
@inject("TodoManager", "ConfigService")
export class CreateTodoController extends Controller
{
    private readonly _todoManager: TodoManager;
    private readonly _configService: ConfigService;
    // private readonly _eventBus: EventBus;


    public constructor(todoManager: TodoManager, configService: ConfigService)
    {
        given(todoManager, "todoManager").ensureHasValue();
        given(configService, "configService").ensureHasValue();
        // given(eventBus, "eventBus").ensureHasValue().ensureIsObject();
        super();
        this._todoManager = todoManager;
        this._configService = configService;
        // this._eventBus = eventBus;
    }


    public async execute(model: Model): Promise<any>
    {
        this._validateModel(model);

        const todo = await this._todoManager.addTodo(model.title, model.description);
        // await this._eventBus.publish(new TodoCreated(todo.id));

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