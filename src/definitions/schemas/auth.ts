import { z } from 'zod';

export const AuthCallbackQuerySchema = z.object({
    code: z.string(),
    iss: z.string(),
});

export const AuthCallbackResponseSchema = z.object({});

export type AuthCallbackQuery = z.infer<typeof AuthCallbackQuerySchema>;
