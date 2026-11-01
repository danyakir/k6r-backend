import { fastifyPlugin } from 'fastify-plugin';

export const resourcesConnector = fastifyPlugin(async app => {
    app.addHook('onReady', () => app.ResourcesService.connectAll());
    app.addHook('onClose', () => app.ResourcesService.quitAll());
});
