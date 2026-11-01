export type Script = {
    id: string;
    name: string;
    description?: string;
    memory: number;
    cpu: number;
    lastRun?: Date;
    isRunning: boolean;
    groupName: string;
};
