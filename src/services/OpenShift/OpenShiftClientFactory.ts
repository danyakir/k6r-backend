import { BatchV1Api, CoreV1Api, KubeConfig } from '@kubernetes/client-node';
import { singleton } from 'tsyringe';

import { OpenShiftClient, OpenShiftConfig } from '@definitions';
import { UnprocessableError } from '@errors';
import logger from '@logger';

@singleton()
export class OpenShiftClientFactory {
    private clientCache = new Map<string, OpenShiftClient>();

    constructor() {}

    public getClient(groupName: string): OpenShiftClient | undefined {
        return this.clientCache.get(groupName);
    }

    async createClient({ groupName, url, token, namespace }: OpenShiftConfig) {
        try {
            const kubeConfic = new KubeConfig();
            kubeConfic.loadFromOptions({
                clusters: [
                    {
                        name: 'k6-cloud-runner-cluster',
                        server: url,
                        skipTLSVerify: true,
                    },
                ],
                users: [
                    {
                        name: 'k6-cloud-runner-user',
                        token: token,
                    },
                ],
                contexts: [
                    {
                        name: 'k6-cloud-runner-context',
                        cluster: 'k6-cloud-runner-cluster',
                        user: 'k6-cloud-runner-user',
                        namespace: namespace,
                    },
                ],
                currentContext: 'k6-cloud-runner-context',
            });

            const coreV1Client = kubeConfic.makeApiClient(CoreV1Api);

            const batchV1Client = kubeConfic.makeApiClient(BatchV1Api);

            await batchV1Client.listNamespacedJob(namespace);

            const client: OpenShiftClient = {
                coreV1Client: coreV1Client,
                batchV1Client: batchV1Client,
                namespace: namespace,
            };

            this.clientCache.set(groupName, client);
        } catch (error) {
            logger.info(`OpenShiftClientFactory: error in creating client`, {
                groupName,
                error,
            });

            throw new UnprocessableError(`OpenShift configuration is invalid`);
        }
    }

    removeClientFromCache(groupName: string): void {
        this.clientCache.delete(groupName);
    }

    clearCache(): void {
        this.clientCache.clear();
    }
}
