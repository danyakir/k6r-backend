import { sendCookies } from 'api/utils/sendCookies';
import configuration from 'configuration';
import { FastifyReply } from 'fastify';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { StatusCodes } from 'http-status-codes';

import {
    defaultResponseError,
    AuthCallbackQuerySchema,
    EmptySchema,
} from '@schemas';

export const authRouter: FastifyPluginAsyncZod = async app => {
    app.get(
        '/login',
        {
            schema: {
                response: {
                    ...defaultResponseError,
                    [StatusCodes.MOVED_TEMPORARILY]: EmptySchema,
                },
            },
        },
        (_, reply: FastifyReply) => {
            const authUrl =
                app.AuthenticationService.generateAuthenticationUrl();

            return reply.redirect(authUrl);
        },
    );

    app.get(
        '/callback',
        {
            schema: {
                querystring: AuthCallbackQuerySchema,
                response: {
                    ...defaultResponseError,
                    [StatusCodes.OK]: EmptySchema,
                },
            },
        },
        async ({ query }, reply: FastifyReply) => {
            const ssoUser =
                await app.AuthenticationService.handleAuthenticationCallback(
                    query,
                );

            sendCookies(reply, ssoUser.tokenSet, ssoUser.userInfo.groups);

            reply.redirect(configuration.CLIENT.home);
        },
    );
};
