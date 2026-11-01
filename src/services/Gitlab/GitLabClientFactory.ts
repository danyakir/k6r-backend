import { Gitlab } from '@gitbeaker/rest';
import { singleton } from 'tsyringe';

import { GitLabClient, GitLabConfig } from '@definitions';
import { UnprocessableError } from '@errors';
import logger from '@logger';

@singleton()
export class GitLabClientFactory {
    private clientCache = new Map<string, GitLabClient>();

    constructor() {}

    public getClient(groupName: string): GitLabClient | undefined {
        return this.clientCache.get(groupName);
    }

    public async createClient({
        groupName,
        url,
        token,
        scriptsPath,
        branch,
    }: GitLabConfig) {
        try {
            const { host, repoDir } = this.parseUrl(url);

            const gitLab = new Gitlab({
                host: host,
                token: token,
            });

            await gitLab.Repositories.allRepositoryTrees(repoDir, {
                path: scriptsPath,
                ref: branch,
            });

            this.clientCache.set(groupName, {
                gitLab,
                repoDir,
                scriptsPath,
                branch,
            });
        } catch (error) {
            logger.info(`GitLabClientFactory: error in creating client`, {
                groupName,
                error,
            });

            throw new UnprocessableError(`GitLab configuration is invalid`);
        }
    }

    private parseUrl(url: string): { host: string; repoDir: string } {
        const u = new URL(url);
        const pathName = u.pathname.replace(/^\/+/, '');
        return { host: u.origin, repoDir: pathName };
    }

    removeClientFromCache(groupName: string): void {
        this.clientCache.delete(groupName);
    }

    clearCache(): void {
        this.clientCache.clear();
    }
}
