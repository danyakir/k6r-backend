import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { StatusCodes } from 'http-status-codes';

import {
    ErrorResponseSchema,
    defaultResponseError,
    SettingsSchema,
} from '@schemas';
import { AuthenticateUser } from 'api/hooks';

export const settingsRouter: FastifyPluginAsyncZod = async app => {
    app.addHook('preHandler', AuthenticateUser);

    app.get(
        '/get',
        {
            schema: {
                response: {
                    ...defaultResponseError,
                    [StatusCodes.BAD_REQUEST]: ErrorResponseSchema,
                    [StatusCodes.OK]: SettingsSchema,
                },
            },
        },
        request => app.SettingsService.getSettings(request.group.name),
    );

    app.post(
        '/change',
        {
            schema: {
                body: SettingsSchema,
                response: {
                    ...defaultResponseError,
                    [StatusCodes.BAD_REQUEST]: ErrorResponseSchema,
                    [StatusCodes.OK]: SettingsSchema,
                },
            },
        },
        request =>
            app.SettingsService.editSettings(request.group.name, request.body),
    );
};
