import { fastifyPlugin } from 'fastify-plugin';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '@errors';
import logger from '@logger';
import { ErrorResponse } from '@schemas';

const isErrorStatus = (status: number) => status >= 400;

export const errorHandler = fastifyPlugin((app, _options, done) => {
    app.setErrorHandler((error, _request, reply) => {
        logger.error('Error caught in error handler', { error });

        let statusCode = isErrorStatus(reply.statusCode)
            ? reply.statusCode
            : StatusCodes.INTERNAL_SERVER_ERROR;

        const errorContent: ErrorResponse = {
            error: 'unexpected-error',
            description: 'Unexpected error in service',
        };

        if (hasZodFastifySchemaValidationErrors(error)) {
            statusCode = StatusCodes.BAD_REQUEST;

            errorContent.error = 'invalid-parameters';
            errorContent.description = error.message;
            errorContent.extraDetails = {
                issues: error.validation,
            };
        } else if (error instanceof ApiError) {
            statusCode = error.statusCode;

            errorContent.error = error.name;
            errorContent.description = error.message;
            errorContent.extraDetails = error.extraDetails;
        }

        reply.status(statusCode).send(errorContent);
    });

    done();
});
