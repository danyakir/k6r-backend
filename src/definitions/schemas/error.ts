import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export const ErrorResponseSchema = z.object({
    error: z.string(),
    description: z.string(),
    extraDetails: z.record(z.string(), z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const defaultResponseError = {
    [StatusCodes.UNAUTHORIZED]: ErrorResponseSchema,
    [StatusCodes.FORBIDDEN]: ErrorResponseSchema,
    [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorResponseSchema,
};

export const defaultScriptsResponseError = {
    ...defaultResponseError,
    [StatusCodes.UNPROCESSABLE_ENTITY]: ErrorResponseSchema,
};
