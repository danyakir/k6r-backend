import configuration from 'configuration';
import { fastifyPlugin } from 'fastify-plugin';

export const cookies = fastifyPlugin(async app => {
    await app.register(import('@fastify/cookie'), {
        parseOptions: {
            domain: configuration.AUTHENTICATION.SSO.cookiesDomain,
            path: '/',
            secure: configuration.SERVICE.env == 'prod',
            sameSite: 'strict',
        },
    });
});
