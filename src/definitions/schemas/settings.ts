import { z } from 'zod';

const EnvVarsSchema = z.object({
    name: z.string(),
    value: z.string(),
});

export const SettingsSchema = z.object({
    gitlabUrl: z.string().optional(),
    gitlabToken: z.string().optional(),
    ocUrl: z.string().optional(),
    ocToken: z.string().optional(),
    ocNamespace: z.string().optional(),
    scriptsRoute: z.string().optional(),
    prometheusUrl: z.string().optional(),
    branchName: z.string().optional(),
    enviormentParams: z.array(EnvVarsSchema).optional(),
});

export type Settings = z.infer<typeof SettingsSchema>;
