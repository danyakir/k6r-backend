import 'definitions/fastify';
import 'reflect-metadata';
import { createApi } from 'api/createApi';
import configuration from 'configuration';

import logger from '@logger';

const onShutdown = (callback: () => void) => {
    process.once('SIGTERM', callback);
    process.once('SIGINT', callback);
};

const main = async () => {
    logger.info('Starting App');
    const app = await createApi();

    const { port, host } = configuration.SERVICE;
    const address = await app.listen({ port, host });

    logger.info(`Service listening on ${address}`);

    onShutdown(async () => {
        logger.info('Shutting down server');

        await app.close();

        logger.info('Goodbye 👋');
    });
};

main();
