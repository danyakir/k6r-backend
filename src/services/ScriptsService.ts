import { injectable } from 'tsyringe';

import { IScriptsService, JobData, Script, Execution } from '@definitions';
import logger from '@logger';
import { EditScriptBody } from '@schemas';
import {
    GroupsRepository,
    HistoryRepository,
    ScriptsRepository,
} from '@postgres';

import { GitLabHelper } from './Gitlab/GitLabHelper';
import { JobsMonitor } from './Listeners/JobsMonitor';
import { OpenShiftHelper } from './OpenShift/OpenShiftHelper';

@injectable()
export class ScriptsService implements IScriptsService {
    constructor(
        private readonly openShiftHelper: OpenShiftHelper,
        private readonly gitLabHelper: GitLabHelper,
        private readonly scriptsRepository: ScriptsRepository,
        private readonly groupsRepository: GroupsRepository,
        private readonly historyRepository: HistoryRepository,
        private readonly jobsMonitor: JobsMonitor,
    ) {}

    public async getScripts(groupName: string): Promise<Script[]> {
        await this.validateThirdPartyClients(groupName);

        return await this.refreshScripts(groupName);
    }

    public async editScript(
        groupName: string,
        scriptId: string,
        payload: EditScriptBody,
    ) {
        return await this.scriptsRepository.editScript(
            groupName,
            scriptId,
            payload,
        );
    }

    private async refreshScripts(groupName: string): Promise<Script[]> {
        const gitScripts = await this.gitLabHelper.getScripts(groupName);
        return await this.scriptsRepository.upsertScriptsFromGit(
            groupName,
            gitScripts,
        );
    }

    public async runScript(
        groupName: string,
        scriptId: string,
    ): Promise<Execution> {
        await this.validateThirdPartyClients(groupName);

        const group = await this.groupsRepository.getValidatedGroup(groupName);
        const script = await this.scriptsRepository.getScript(scriptId);
        const runningId = `${script.id}${Math.floor(Math.random() * 10000)}`;

        const jobData: JobData = {
            groupName: groupName,
            branch: group.branchName,
            id: runningId,
            name: script.name,
            resources: {
                cpu: script.cpu,
                memory: script.memory,
            },
            gitlabUrl: group.gitlabUrl,
            gitlabToken: group.gitlabToken,
            enviormentParams: group.enviormentParams,
            prometheusUrl: group.prometheusUrl,
            scriptsRoute: group.scriptsRoute,
        };

        const job = this.openShiftHelper.createJob(jobData);

        await this.openShiftHelper.runJob(groupName, job);

        const execution = await this.historyRepository.createExecution(
            runningId,
            script.name,
            groupName,
        );

        await this.jobsMonitor.monitorJob(
            groupName,
            execution.id,
            execution.name,
            script.id,
        );

        return execution;
    }

    public async getRunningScript(scriptId: string): Promise<Execution> {
        const script = await this.scriptsRepository.getScript(scriptId);
        const execution = await this.historyRepository.getRunningScript(
            script.name,
            script.groupName,
        );

        return execution;
    }

    public async abortScript(groupName: string, scriptId: string) {
        // ToDo: right now i allow to run one script so this works in near future find a solution to have multiple running in the same time. Could be done with an array attached to scripts
        await this.validateThirdPartyClients(groupName);

        const { id, name } = await this.getRunningScript(scriptId);

        logger.info(`ScriptsService: Aborting script`, {
            groupName,
            id,
            name,
        });

        await this.jobsMonitor.abortMonitor(id, scriptId);
        await this.openShiftHelper.deleteJob(groupName, id, name);
    }

    public async getHistory(groupName: string): Promise<Execution[]> {
        return await this.historyRepository.getHistory(groupName);
    }

    private async validateThirdPartyClients(groupName: string) {
        const isOpenShiftClientCached =
            this.openShiftHelper.isCachedClient(groupName);

        const isGitLabClientCached =
            this.gitLabHelper.isCachedClient(groupName);

        if (!isOpenShiftClientCached || !isGitLabClientCached) {
            const group = await this.groupsRepository.getValidatedGroup(
                groupName,
            );

            if (!isOpenShiftClientCached) {
                logger.info(`ScriptsService: creating oc client`, {
                    groupName,
                });

                await this.openShiftHelper.createClient({
                    groupName: groupName,
                    url: group.ocUrl,
                    token: group.ocToken,
                    namespace: group.ocNamespace,
                });
            }

            if (!isGitLabClientCached) {
                logger.info(`ScriptsService: creating gitlab client`, {
                    groupName,
                });

                await this.gitLabHelper.createClient({
                    groupName: groupName,
                    url: group.gitlabUrl,
                    token: group.gitlabToken,
                    scriptsPath: group.scriptsRoute,
                    branch: group.branchName,
                });
            }
        }
    }
}
