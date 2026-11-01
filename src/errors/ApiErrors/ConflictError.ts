import { StatusCodes } from 'http-status-codes';

import { ApiError } from './ApiError';

export class ConflictError extends ApiError {
    constructor(message = 'Conflict Error') {
        super('conflict-error', message, StatusCodes.CONFLICT);
    }
}
