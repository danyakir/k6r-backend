import { StatusCodes } from 'http-status-codes';

import { ApiError } from './ApiError';

export class UnprocessableError extends ApiError {
    constructor(message = 'Unprocessable Error') {
        super('unprocessable-error', message, StatusCodes.UNPROCESSABLE_ENTITY);
    }
}
