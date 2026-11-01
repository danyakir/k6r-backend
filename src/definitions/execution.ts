export type Execution = {
    id: string;
    name: string;
    startTime: Date;
    endTime?: Date;
    maxVus?: number;
    responseTime?: string;
    status: Status;
    groupName: string;
};

export type Status = 'running' | 'completed' | 'failed' | 'aborted';
