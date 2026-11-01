import { onResponseHookHandler } from 'fastify';

import logger from '@logger';

export const LogResponse: onResponseHookHandler = (request, reply, done) => {
    logger.info('Sending response to client', {
        groupName: request.headers['x-current-group'],
        url: request.url,
        body: request.body,
        status: reply.statusCode,
    });

    done();
};
