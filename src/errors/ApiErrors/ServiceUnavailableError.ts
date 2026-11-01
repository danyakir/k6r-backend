import { StatusCodes } from 'http-status-codes';

import { ApiError } from './ApiError';

export class ServiceUnavailableError extends ApiError {
    constructor() {
        super(
            'service-unavailable-error',
            'Service is currently unavailable',
            StatusCodes.SERVICE_UNAVAILABLE,
        );
    }
}
