import fastify from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod';

import { LogRequest, LogResponse, AuthenticateUser } from './hooks';
import {
    cookies,
    cors,
    errorHandler,
    injectDependencies,
    resourcesConnector,
} from './plugins';
import {
    authRouter,
    healthRouter,
    scriptsRouter,
    settingsRouter,
} from './routes';

export const createApi = async () => {
    const app = fastify();

    app.register(errorHandler);

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(cookies);
    app.register(cors);

    injectDependencies(app);
    app.register(resourcesConnector);

    app.addHook('preValidation', LogRequest);
    app.addHook('onResponse', LogResponse);

    app.register(authRouter, { prefix: '/oauth' });
    app.register(healthRouter);
    app.register(scriptsRouter, { prefix: '/scripts' });
    app.register(settingsRouter, { prefix: '/settings' });

    return app;
};
