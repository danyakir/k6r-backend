import { StatusCodes } from 'http-status-codes';

import { ApiError } from './ApiError';

export class ForbiddenError extends ApiError {
    constructor(message = 'User does not have permission') {
        super('forbidden-error', message, StatusCodes.FORBIDDEN);
    }
}
