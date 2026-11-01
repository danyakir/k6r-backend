import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { StatusCodes } from 'http-status-codes';

import { HealthResponseSchema, ErrorResponseSchema } from '@schemas';

export const healthRouter: FastifyPluginAsyncZod = async app => {
    app.get(
        '/liveness',
        {
            schema: {
                response: {
                    [StatusCodes.OK]: HealthResponseSchema,
                },
            },
        },
        () => app.HealthService.getLiveness(),
    );

    app.get(
        '/readiness',
        {
            schema: {
                response: {
                    [StatusCodes.OK]: HealthResponseSchema,
                    [StatusCodes.SERVICE_UNAVAILABLE]: ErrorResponseSchema,
                },
            },
        },
        () => app.HealthService.getReadiness(),
    );
};
