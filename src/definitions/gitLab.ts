import { Gitlab } from '@gitbeaker/rest';

export type GitLabClient = {
    gitLab: InstanceType<typeof Gitlab>;
    repoDir: string;
    scriptsPath: string;
    branch: string;
};

export interface GitLabConfig {
    groupName: string;
    url: string;
    token: string;
    scriptsPath: string;
    branch: string;
}
