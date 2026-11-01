import { StatusCodes } from 'http-status-codes';

import { ApiError } from './ApiError';

export class UnauthorizedError extends ApiError {
    constructor(message = 'Unable to authenticate') {
        super('unauthorized-error', message, StatusCodes.UNAUTHORIZED);
    }
}
