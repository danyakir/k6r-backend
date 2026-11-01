import { fastifyPlugin } from 'fastify-plugin';

export const cors = fastifyPlugin(async app => {
    await app.register(import('@fastify/cors'), {
        origin: true,
        exposedHeaders: ['location'],
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
    });
});
