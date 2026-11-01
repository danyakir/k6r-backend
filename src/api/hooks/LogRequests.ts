import { preValidationHookHandler } from 'fastify';

import logger from '@logger';

export const LogRequest: preValidationHookHandler = (request, _, done) => {
    logger.info(`Got new request`, {
        groupName: request.headers['x-current-group'],
        url: request.url,
        body: request.body,
    });

    done();
};
