import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { StatusCodes } from 'http-status-codes';

import {
    EditScriptBodySchema,
    EditScriptParamsSchema,
    ExecutionSchema,
    GetScriptsSchema,
    getHistorySchema,
    ErrorResponseSchema,
    defaultScriptsResponseError,
    EmptySchema,
} from '@schemas';

import { AuthenticateUser } from 'api/hooks';

export const scriptsRouter: FastifyPluginAsyncZod = async app => {
    app.addHook('preHandler', AuthenticateUser);

    app.get(
        '/get',
        {
            schema: {
                response: {
                    ...defaultScriptsResponseError,
                    [StatusCodes.OK]: GetScriptsSchema,
                },
            },
        },
        request => app.ScriptsService.getScripts(request.group.name),
    );

    app.put(
        '/:id',
        {
            schema: {
                body: EditScriptBodySchema,
                params: EditScriptParamsSchema,
                response: {
                    ...defaultScriptsResponseError,
                    [StatusCodes.BAD_REQUEST]: ErrorResponseSchema,
                    [StatusCodes.OK]: EmptySchema,
                },
            },
        },
        request =>
            app.ScriptsService.editScript(
                request.group.name,
                request.params.id,
                request.body,
            ),
    );

    app.post(
        '/run/:id',
        {
            schema: {
                params: EditScriptParamsSchema,
                response: {
                    ...defaultScriptsResponseError,
                    [StatusCodes.BAD_REQUEST]: ErrorResponseSchema,
                    [StatusCodes.CONFLICT]: ErrorResponseSchema,
                    [StatusCodes.OK]: ExecutionSchema,
                },
            },
        },
        request =>
            app.ScriptsService.runScript(request.group.name, request.params.id),
    );

    app.post(
        '/abort/:id',
        {
            schema: {
                params: EditScriptParamsSchema,
                response: {
                    ...defaultScriptsResponseError,
                    [StatusCodes.BAD_REQUEST]: ErrorResponseSchema,
                    [StatusCodes.OK]: EmptySchema,
                },
            },
        },
        request =>
            app.ScriptsService.abortScript(
                request.group.name,
                request.params.id,
            ),
    );

    app.get(
        '/running/:id',
        {
            schema: {
                params: EditScriptParamsSchema,
                response: {
                    ...defaultScriptsResponseError,
                    [StatusCodes.BAD_REQUEST]: ErrorResponseSchema,
                    [StatusCodes.OK]: ExecutionSchema,
                },
            },
        },
        request => app.ScriptsService.getRunningScript(request.params.id),
    );

    app.get(
        '/history',
        {
            schema: {
                response: {
                    ...defaultScriptsResponseError,
                    [StatusCodes.OK]: getHistorySchema,
                },
            },
        },
        request => app.ScriptsService.getHistory(request.group.name),
    );
};
