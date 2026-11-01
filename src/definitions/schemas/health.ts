import { z } from 'zod';

export const HealthResponseSchema = z.object({ message: z.string() });

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
