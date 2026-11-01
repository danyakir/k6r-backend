import { z } from 'zod';

export const ScriptSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    memory: z.number(),
    cpu: z.number(),
    lastRun: z.date().optional(),
    isRunning: z.boolean(),
    groupName: z.string(),
});

export const ExecutionSchema = z.object({
    id: z.string(),
    name: z.string(),
    startTime: z.date(),
    endTime: z.date().optional(),
    maxVus: z.number().optional(),
    responseTime: z.string().optional(),
    status: z.enum(['running', 'completed', 'failed', 'aborted']),
    groupName: z.string(),
});

export const GetScriptsSchema = z.array(ScriptSchema);
export const getHistorySchema = z.array(ExecutionSchema);

export const EditScriptParamsSchema = z.object({ id: z.string() });

export const EditScriptBodySchema = z.object({
    diff: z.union([
        z.object({ description: z.string() }),
        z.object({ memory: z.number() }),
        z.object({ cpu: z.number() }),
    ]),
});

export type EditScriptParams = z.infer<typeof EditScriptParamsSchema>;

export type EditScriptBody = z.infer<typeof EditScriptBodySchema>;
