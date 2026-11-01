import { StatusCodes } from 'http-status-codes';

import { ApiError } from './ApiError';

export class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super('bad-request-error', message, StatusCodes.BAD_REQUEST);
    }
}
