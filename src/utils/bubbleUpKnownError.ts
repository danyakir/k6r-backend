import { ApiError, ServiceError } from '@errors';

export const bubbleUpKnownError = (error: Error) => {
    if (error instanceof ApiError || error instanceof ServiceError) {
        throw error;
    }
};
