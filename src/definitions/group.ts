import { V1EnvVar } from '@kubernetes/client-node';

export type Group = {
    id: string;
    name: string;
    gitlabUrl?: string;
    gitlabToken?: string;
    ocUrl?: string;
    ocToken?: string;
    ocNamespace?: string;
    scriptsRoute?: string;
    prometheusUrl?: string;
    branchName?: string;
    enviormentParams?: V1EnvVar[];
};

export type ValidatedGroup = {
    id: string;
    name: string;
    gitlabUrl: string;
    gitlabToken: string;
    ocUrl: string;
    ocToken: string;
    ocNamespace: string;
    scriptsRoute: string;
    prometheusUrl: string;
    branchName: string;
    enviormentParams: V1EnvVar[];
};
