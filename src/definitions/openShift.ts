import { BatchV1Api, CoreV1Api, V1EnvVar } from '@kubernetes/client-node';

export type OpenShiftClient = {
    coreV1Client: CoreV1Api;
    batchV1Client: BatchV1Api;
    namespace: string;
};

export interface OpenShiftConfig {
    groupName: string;
    url: string;
    token: string;
    namespace: string;
}

export interface JobData {
    groupName: string;
    branch: string;
    id: string;
    name: string;
    resources: { cpu: number; memory: number };
    gitlabUrl: string;
    gitlabToken: string;
    enviormentParams?: V1EnvVar[];
    scriptsRoute?: string;
    prometheusUrl?: string;
}
