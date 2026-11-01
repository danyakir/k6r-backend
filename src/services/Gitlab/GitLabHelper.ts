import { injectable } from 'tsyringe';

import { GitLabConfig } from '@definitions';
import { UnprocessableError } from '@errors';
import logger from '@logger';

import { GitLabClientFactory } from './GitLabClientFactory';

@injectable()
export class GitLabHelper {
    constructor(private clientFactory: GitLabClientFactory) {}

    public isCachedClient(groupName: string): boolean {
        return !!this.clientFactory.getClient(groupName);
    }

    public async createClient(openShiftConfig: GitLabConfig) {
        await this.clientFactory.createClient(openShiftConfig);
    }

    public removeCurrentClient(groupName: string) {
        if (this.isCachedClient(groupName)) {
            this.clientFactory.removeClientFromCache(groupName);
        }
    }

    public async getScripts(groupName: string): Promise<string[]> {
        try {
            const gitLabClient = this.clientFactory.getClient(groupName);

            const files =
                await gitLabClient.gitLab.Repositories.allRepositoryTrees(
                    gitLabClient.repoDir,
                    {
                        path: gitLabClient.scriptsPath,
                        ref: gitLabClient.branch,
                    },
                );

            const filesNames = files.map(file => file.name);

            return filesNames;
        } catch (error) {
            logger.error(`Couldn't get files from git repo`, { groupName });

            throw new UnprocessableError(`GitLab configuration is invalid`);
        }
    }
}
