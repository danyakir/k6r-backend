import configuration from 'configuration';
import { OpenShiftHelper } from 'services/OpenShift/OpenShiftHelper';
import { singleton } from 'tsyringe';

import logger from '@logger';
import { bubbleUpKnownError } from '@utils';
import { HistoryRepository, ScriptsRepository } from '@postgres';

@singleton()
export class JobsMonitor {
    private monitorCache = new Map<string, NodeJS.Timeout>();
    timeBetweenJobCheckups = Number(
        configuration.DEFAULTS.OC.timeBetweenJobCheckups,
    );

    constructor(
        private readonly openShiftHelper: OpenShiftHelper,
        private readonly historyRepository: HistoryRepository,
        private readonly scriptsRepository: ScriptsRepository,
    ) {}

    private closeMonitor(id: string) {
        try {
            this.monitorCache.get(id).close();
            this.monitorCache.delete(id);
        } catch (error) {
            logger.info(`JobsMonitor: monitor is already closed`, { id });
        }
    }

    private addMonitor(id: string, monitor: NodeJS.Timeout) {
        this.monitorCache.set(id, monitor);
    }

    public clearCache() {
        for (const value of this.monitorCache.values()) {
            value.close();
        }
        this.monitorCache.clear();
    }

    private async changeIsRunningStatus(scriptId: string, isRunning: boolean) {
        await this.scriptsRepository.updateIsScriptRunning(scriptId, isRunning);
    }

    public async monitorJob(
        groupName: string,
        id: string,
        name: string,
        scriptId: string,
    ) {
        logger.info(`Job is being monitored`, {
            groupName,
            id,
            name,
            scriptId,
        });

        await this.changeIsRunningStatus(scriptId, true);

        this.addMonitor(
            id,
            setInterval(async () => {
                try {
                    const status = await this.openShiftHelper.checkJobStatus(
                        groupName,
                        id,
                        name,
                    );

                    if (status.body.status.active > 0) {
                        return;
                    }

                    if (status.body.status.conditions[0].type === 'Complete') {
                        this.closeMonitor(id);
                        await this.historyRepository.updateScriptStatus(
                            id,
                            'completed',
                        );
                        this.changeIsRunningStatus(scriptId, false);
                        await this.openShiftHelper.deleteJob(
                            groupName,
                            id,
                            name,
                        );
                    }

                    if (status.body.status.conditions[0].type === 'Failed') {
                        this.closeMonitor(id);
                        await this.historyRepository.updateScriptStatus(
                            id,
                            'failed',
                        );
                        this.changeIsRunningStatus(scriptId, false);
                    }
                } catch (error) {
                    bubbleUpKnownError(error);

                    this.closeMonitor(id);

                    this.changeIsRunningStatus(scriptId, false);

                    await this.historyRepository.updateScriptStatus(
                        id,
                        'failed',
                    );
                }
            }, this.timeBetweenJobCheckups),
        );
    }

    public async abortMonitor(id: string, scriptId: string) {
        this.closeMonitor(id);
        await this.historyRepository.updateScriptStatus(id, 'aborted');
        this.changeIsRunningStatus(scriptId, false);
    }
}
