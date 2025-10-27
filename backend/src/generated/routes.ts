/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { WorkspaceController } from './../controllers/workspace.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EventController } from './../controllers/event.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ChatController } from './../controllers/chat.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/auth.controller';
import { expressAuthentication } from './../middleware/auth';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Record_string.unknown_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WorkspaceResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "timezoneCode": {"dataType":"string","required":true},
            "color": {"dataType":"string","required":true},
            "icon": {"dataType":"string"},
            "isArchived": {"dataType":"boolean","required":true},
            "metadata": {"ref":"Record_string.unknown_"},
            "ownerId": {"dataType":"string","required":true},
            "order": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "memberCount": {"dataType":"double"},
            "eventCount": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_WorkspaceResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"WorkspaceResponse"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"enum","enums":[false],"required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateWorkspaceDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "timezoneCode": {"dataType":"string"},
            "color": {"dataType":"string"},
            "icon": {"dataType":"string"},
            "order": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_WorkspaceResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"WorkspaceResponse"}},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateWorkspaceDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
            "timezoneCode": {"dataType":"string"},
            "color": {"dataType":"string"},
            "icon": {"dataType":"string"},
            "isArchived": {"dataType":"boolean"},
            "order": {"dataType":"double"},
            "metadata": {"ref":"Record_string.unknown_"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_void_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"void"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AddWorkspaceMemberDto": {
        "dataType": "refObject",
        "properties": {
            "userIds": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RemoveWorkspaceMemberDto": {
        "dataType": "refObject",
        "properties": {
            "userId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__id-string--name-string--email-string--role-string_-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"role":{"dataType":"string","required":true},"email":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "start": {"dataType":"datetime","required":true},
            "end": {"dataType":"datetime","required":true},
            "status": {"dataType":"string","required":true},
            "location": {"dataType":"string"},
            "color": {"dataType":"string","required":true},
            "isAllDay": {"dataType":"boolean","required":true},
            "recurrenceRule": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
            "metadata": {"ref":"Record_string.unknown_"},
            "workspaceId": {"dataType":"string","required":true},
            "createdById": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "assignees": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_EventResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"EventResponse"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateEventDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "start": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"string"}],"required":true},
            "end": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"string"}],"required":true},
            "workspaceId": {"dataType":"string","required":true},
            "assigneeIds": {"dataType":"array","array":{"dataType":"string"}},
            "location": {"dataType":"string"},
            "color": {"dataType":"string"},
            "isAllDay": {"dataType":"boolean"},
            "recurrenceRule": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_EventResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"EventResponse"}},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateEventDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
            "start": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"string"}]},
            "end": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"string"}]},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["scheduled"]},{"dataType":"enum","enums":["in_progress"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["cancelled"]}]},
            "location": {"dataType":"string"},
            "color": {"dataType":"string"},
            "isAllDay": {"dataType":"boolean"},
            "recurrenceRule": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
            "metadata": {"ref":"Record_string.unknown_"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AssignEventDto": {
        "dataType": "refObject",
        "properties": {
            "userIds": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UnassignEventDto": {
        "dataType": "refObject",
        "properties": {
            "userId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__threadId-string--status-string--message-string-or-null--intent_63_-string--currentWorkflow_63_-string--interrupt_63__58__type-collect_info-or-confirm-or-conflict_resolution--payload-unknown_--missingFields_63_-string-Array--suggestedResponses_63_-string-Array--data_63_-unknown--error_63_-string__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"error":{"dataType":"string"},"data":{"dataType":"any"},"suggestedResponses":{"dataType":"array","array":{"dataType":"string"}},"missingFields":{"dataType":"array","array":{"dataType":"string"}},"interrupt":{"dataType":"nestedObjectLiteral","nestedProperties":{"payload":{"dataType":"any","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["collect_info"]},{"dataType":"enum","enums":["confirm"]},{"dataType":"enum","enums":["conflict_resolution"]}],"required":true}}},"currentWorkflow":{"dataType":"string"},"intent":{"dataType":"string"},"message":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"status":{"dataType":"string","required":true},"threadId":{"dataType":"string","required":true}}},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChatMessageDto": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string"},
            "userName": {"dataType":"string"},
            "workspaceId": {"dataType":"string"},
            "threadId": {"dataType":"string"},
            "response": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"boolean"}]},
            "blocked": {"dataType":"boolean"},
            "simulateConflict": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__threadId-string--status-string--message-string-or-null--intent_63_-string--currentWorkflow_63_-string--interrupt_63__58__type-collect_info-or-confirm-or-conflict_resolution--payload-unknown_--missingFields_63_-string-Array--suggestedResponses_63_-string-Array--data_63_-unknown--error_63_-string_-or-null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"error":{"dataType":"string"},"data":{"dataType":"any"},"suggestedResponses":{"dataType":"array","array":{"dataType":"string"}},"missingFields":{"dataType":"array","array":{"dataType":"string"}},"interrupt":{"dataType":"nestedObjectLiteral","nestedProperties":{"payload":{"dataType":"any","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["collect_info"]},{"dataType":"enum","enums":["confirm"]},{"dataType":"enum","enums":["conflict_resolution"]}],"required":true}}},"currentWorkflow":{"dataType":"string"},"intent":{"dataType":"string"},"message":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"status":{"dataType":"string","required":true},"threadId":{"dataType":"string","required":true}}},{"dataType":"enum","enums":[null]}]},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthResponse": {
        "dataType": "refObject",
        "properties": {
            "user": {"dataType":"nestedObjectLiteral","nestedProperties":{"role":{"dataType":"string","required":true},"email":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"required":true},
            "accessToken": {"dataType":"string","required":true},
            "refreshToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AuthResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"AuthResponse"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__accessToken-string__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"accessToken":{"dataType":"string","required":true}}},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefreshTokenDto": {
        "dataType": "refObject",
        "properties": {
            "refreshToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "role": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UserResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"UserResponse"},
            "timestamp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsWorkspaceController_createWorkspace: Record<string, TsoaRoute.ParameterSchema> = {
                createDto: {"in":"body","name":"createDto","required":true,"ref":"CreateWorkspaceDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/workspaces',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController)),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.createWorkspace)),

            async function WorkspaceController_createWorkspace(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkspaceController_createWorkspace, request, response });

                const controller = new WorkspaceController();

              await templateService.apiHandler({
                methodName: 'createWorkspace',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkspaceController_getUserWorkspaces: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/workspaces',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController)),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.getUserWorkspaces)),

            async function WorkspaceController_getUserWorkspaces(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkspaceController_getUserWorkspaces, request, response });

                const controller = new WorkspaceController();

              await templateService.apiHandler({
                methodName: 'getUserWorkspaces',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkspaceController_getWorkspaceById: Record<string, TsoaRoute.ParameterSchema> = {
                workspaceId: {"in":"path","name":"workspaceId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/workspaces/:workspaceId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController)),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.getWorkspaceById)),

            async function WorkspaceController_getWorkspaceById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkspaceController_getWorkspaceById, request, response });

                const controller = new WorkspaceController();

              await templateService.apiHandler({
                methodName: 'getWorkspaceById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkspaceController_updateWorkspace: Record<string, TsoaRoute.ParameterSchema> = {
                workspaceId: {"in":"path","name":"workspaceId","required":true,"dataType":"string"},
                updateDto: {"in":"body","name":"updateDto","required":true,"ref":"UpdateWorkspaceDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.put('/api/workspaces/:workspaceId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController)),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.updateWorkspace)),

            async function WorkspaceController_updateWorkspace(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkspaceController_updateWorkspace, request, response });

                const controller = new WorkspaceController();

              await templateService.apiHandler({
                methodName: 'updateWorkspace',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkspaceController_deleteWorkspace: Record<string, TsoaRoute.ParameterSchema> = {
                workspaceId: {"in":"path","name":"workspaceId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/api/workspaces/:workspaceId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController)),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.deleteWorkspace)),

            async function WorkspaceController_deleteWorkspace(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkspaceController_deleteWorkspace, request, response });

                const controller = new WorkspaceController();

              await templateService.apiHandler({
                methodName: 'deleteWorkspace',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkspaceController_addMembers: Record<string, TsoaRoute.ParameterSchema> = {
                workspaceId: {"in":"path","name":"workspaceId","required":true,"dataType":"string"},
                addMembersDto: {"in":"body","name":"addMembersDto","required":true,"ref":"AddWorkspaceMemberDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/workspaces/:workspaceId/members',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController)),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.addMembers)),

            async function WorkspaceController_addMembers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkspaceController_addMembers, request, response });

                const controller = new WorkspaceController();

              await templateService.apiHandler({
                methodName: 'addMembers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkspaceController_removeMember: Record<string, TsoaRoute.ParameterSchema> = {
                workspaceId: {"in":"path","name":"workspaceId","required":true,"dataType":"string"},
                removeMemberDto: {"in":"body","name":"removeMemberDto","required":true,"ref":"RemoveWorkspaceMemberDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/api/workspaces/:workspaceId/members',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController)),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.removeMember)),

            async function WorkspaceController_removeMember(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkspaceController_removeMember, request, response });

                const controller = new WorkspaceController();

              await templateService.apiHandler({
                methodName: 'removeMember',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWorkspaceController_getWorkspaceMembers: Record<string, TsoaRoute.ParameterSchema> = {
                workspaceId: {"in":"path","name":"workspaceId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/workspaces/:workspaceId/members',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController)),
            ...(fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.getWorkspaceMembers)),

            async function WorkspaceController_getWorkspaceMembers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWorkspaceController_getWorkspaceMembers, request, response });

                const controller = new WorkspaceController();

              await templateService.apiHandler({
                methodName: 'getWorkspaceMembers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEventController_createEvent: Record<string, TsoaRoute.ParameterSchema> = {
                createDto: {"in":"body","name":"createDto","required":true,"ref":"CreateEventDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/events',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.createEvent)),

            async function EventController_createEvent(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEventController_createEvent, request, response });

                const controller = new EventController();

              await templateService.apiHandler({
                methodName: 'createEvent',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEventController_getEvents: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                workspaceId: {"in":"query","name":"workspaceId","dataType":"string"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
                status: {"in":"query","name":"status","dataType":"string"},
                assigneeId: {"in":"query","name":"assigneeId","dataType":"string"},
        };
        app.get('/api/events',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.getEvents)),

            async function EventController_getEvents(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEventController_getEvents, request, response });

                const controller = new EventController();

              await templateService.apiHandler({
                methodName: 'getEvents',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEventController_getEventById: Record<string, TsoaRoute.ParameterSchema> = {
                eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/events/:eventId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.getEventById)),

            async function EventController_getEventById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEventController_getEventById, request, response });

                const controller = new EventController();

              await templateService.apiHandler({
                methodName: 'getEventById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEventController_updateEvent: Record<string, TsoaRoute.ParameterSchema> = {
                eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                updateDto: {"in":"body","name":"updateDto","required":true,"ref":"UpdateEventDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.put('/api/events/:eventId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.updateEvent)),

            async function EventController_updateEvent(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEventController_updateEvent, request, response });

                const controller = new EventController();

              await templateService.apiHandler({
                methodName: 'updateEvent',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEventController_deleteEvent: Record<string, TsoaRoute.ParameterSchema> = {
                eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/api/events/:eventId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.deleteEvent)),

            async function EventController_deleteEvent(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEventController_deleteEvent, request, response });

                const controller = new EventController();

              await templateService.apiHandler({
                methodName: 'deleteEvent',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEventController_assignUsers: Record<string, TsoaRoute.ParameterSchema> = {
                eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                assignDto: {"in":"body","name":"assignDto","required":true,"ref":"AssignEventDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/events/:eventId/assignees',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.assignUsers)),

            async function EventController_assignUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEventController_assignUsers, request, response });

                const controller = new EventController();

              await templateService.apiHandler({
                methodName: 'assignUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEventController_unassignUser: Record<string, TsoaRoute.ParameterSchema> = {
                eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                unassignDto: {"in":"body","name":"unassignDto","required":true,"ref":"UnassignEventDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/api/events/:eventId/assignees',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.unassignUser)),

            async function EventController_unassignUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEventController_unassignUser, request, response });

                const controller = new EventController();

              await templateService.apiHandler({
                methodName: 'unassignUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatController_processMessage: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"ChatMessageDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/chat/message',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatController)),
            ...(fetchMiddlewares<RequestHandler>(ChatController.prototype.processMessage)),

            async function ChatController_processMessage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatController_processMessage, request, response });

                const controller = new ChatController();

              await templateService.apiHandler({
                methodName: 'processMessage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatController_getChatStatus: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"threadId":{"dataType":"string","required":true}}},
        };
        app.post('/api/chat/status',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatController)),
            ...(fetchMiddlewares<RequestHandler>(ChatController.prototype.getChatStatus)),

            async function ChatController_getChatStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatController_getChatStatus, request, response });

                const controller = new ChatController();

              await templateService.apiHandler({
                methodName: 'getChatStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_register: Record<string, TsoaRoute.ParameterSchema> = {
                registerDto: {"in":"body","name":"registerDto","required":true,"ref":"RegisterDto"},
        };
        app.post('/api/auth/register',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.register)),

            async function AuthController_register(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_register, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'register',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                loginDto: {"in":"body","name":"loginDto","required":true,"ref":"LoginDto"},
        };
        app.post('/api/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_refreshToken: Record<string, TsoaRoute.ParameterSchema> = {
                refreshTokenDto: {"in":"body","name":"refreshTokenDto","required":true,"ref":"RefreshTokenDto"},
        };
        app.post('/api/auth/refresh',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.refreshToken)),

            async function AuthController_refreshToken(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_refreshToken, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'refreshToken',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_getMe: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/auth/me',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.getMe)),

            async function AuthController_getMe(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_getMe, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'getMe',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
