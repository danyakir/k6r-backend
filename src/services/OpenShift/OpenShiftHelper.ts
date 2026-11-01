import {
    CoreV1Api,
    HttpError,
    V1EnvVar,
    V1Job,
    V1ResourceRequirements,
} from '@kubernetes/client-node';
import { injectable } from 'tsyringe';

import { JobData, OpenShiftConfig } from '@definitions';
import { ConflictError } from '@errors';
import logger from '@logger';
import { bubbleUpKnownError } from '@utils';

import { OpenShiftClientFactory } from './OpenShiftClientFactory';

@injectable()
export class OpenShiftHelper {
    constructor(private clientFactory: OpenShiftClientFactory) {}

    public isCachedClient(groupName: string): boolean {
        return !!this.clientFactory.getClient(groupName);
    }

    public async createClient(openShiftConfig: OpenShiftConfig) {
        await this.clientFactory.createClient(openShiftConfig);
    }

    public removeCurrentClient(groupName: string) {
        if (this.isCachedClient(groupName)) {
            this.clientFactory.removeClientFromCache(groupName);
        }
    }

    async runJob(groupName: string, job: V1Job) {
        try {
            const { coreV1Client, batchV1Client, namespace } =
                this.clientFactory.getClient(groupName);

            const requiredResources = job.spec.template.spec.containers[0]
                .resources.limits as { cpu: string; memory: string };

            await this.validateAvailableReources(
                coreV1Client,
                namespace,
                requiredResources,
            );

            await batchV1Client.createNamespacedJob(namespace, job, 'true');
        } catch (error) {
            bubbleUpKnownError(error);

            if (error instanceof HttpError) {
                logger.error(
                    `OpenShiftHelper: got error from openShift when running job`,
                    {
                        groupName: groupName,
                        status: error.statusCode,
                        message: error.body.message,
                    },
                );

                throw new ConflictError(
                    `Couldn't run job in openShift with status ${error.statusCode} message: ${error.body.message}`,
                );
            }

            logger.error(`OpenShiftHelper: error in running job`, {
                groupName,
                error,
            });

            throw error;
        }
    }

    private async validateAvailableReources(
        coreV1Client: CoreV1Api,
        namespace: string,
        jobResources: { cpu: string; memory: string },
    ) {
        try {
            const quotas = await coreV1Client.listNamespacedResourceQuota(
                namespace,
            );

            quotas.body.items.forEach(quota => {
                if (quota.metadata.name == 'platform-resources') {
                    if (
                        quota.status.hard['count/jobs.batch'] ===
                        quota.status.used['count/jobs.batch']
                    ) {
                        throw new ConflictError(
                            `No availble jobs in ${namespace}`,
                        );
                    }
                }

                if (quota.metadata.name == 'compute-resources') {
                    const availableCpu =
                        parseFloat(quota.status.hard['limits.cpu']) -
                        parseFloat(quota.status.used['limits.cpu']) / 1000;
                    const availableMemory =
                        parseFloat(quota.status.hard['requests.memory']) -
                        parseFloat(quota.status.used['requests.memory']) /
                            1000000000;
                    const neededCpu = parseFloat(jobResources.cpu);
                    const neededMemory = parseFloat(jobResources.memory);

                    if (neededCpu > availableCpu) {
                        throw new ConflictError(
                            `Cpu requested ${neededCpu} is not available in ${namespace}`,
                        );
                    }

                    if (neededMemory > availableMemory) {
                        throw new ConflictError(
                            `Memory requested ${neededMemory} is not available in ${namespace}`,
                        );
                    }
                }
            });
        } catch (error) {
            bubbleUpKnownError(error);

            logger.error(`OpenShiftHelper: couldn't get namespace quota`);

            throw error;
        }
    }

    public async deleteJob(groupName: string, id: string, name: string) {
        try {
            const { batchV1Client, namespace } =
                this.clientFactory.getClient(groupName);
            const jobName = this.getJobName(id, name);

            await batchV1Client.deleteNamespacedJob(
                jobName,
                namespace,
                'true',
                undefined,
                undefined,
                undefined,
                undefined,
                {
                    propagationPolicy: 'Foreground',
                },
            );
        } catch (error) {
            logger.info(`OpenShiftHelper: Job has already stopped running`, {
                groupName,
                id,
                name,
            });
        }
    }

    createJob({
        groupName,
        branch,
        id,
        name,
        resources,
        gitlabUrl,
        gitlabToken,
        enviormentParams,
        scriptsRoute,
        prometheusUrl,
    }: JobData): V1Job {
        const { namespace } = this.clientFactory.getClient(groupName);
        const jobName = this.getJobName(id, name);
        const cloneUrl = this.getCloneUrl(gitlabUrl, gitlabToken);
        const jobResources = this.getResources(resources.cpu, resources.memory);
        const jobEnv = this.getEnv(prometheusUrl, enviormentParams);

        return {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: {
                name: jobName,
                namespace: namespace,
                labels: {
                    'app.kubenetes.io/name': 'k6-script',
                    'app.kubenetes.io/instance': id,
                },
            },
            spec: {
                backoffLimit: 0,
                template: {
                    spec: {
                        restartPolicy: 'Never',
                        containers: [
                            {
                                name: 'k6-script',
                                image: 'registry.example.com/k6r/k6',
                                command: ['/bin/sh', '-c'],
                                args: [
                                    `
                                    # Clone the repository
                                    git clone ${cloneUrl} && cd "$(basename "$_" .git)"
                                    echo "Repository cloned successfully"

                                    # Checkout to branch
                                    git checkout ${branch}

                                    # Install dependencies
                                    npm i && npm i esbuild

                                    # Bundle script file
                                    npx -y esbuild --outfile=build/script.js --bundle --platform=node --external:k6* ${scriptsRoute}/${name}

                                    # Run script
                                    k6 run ./build/script.js --tag script=${name} --tag testid=${id} --insecure-skip-tls-verify -o experimental-prometheus-rw
                                    `,
                                ],
                                env: jobEnv,
                                resources: jobResources,
                            },
                        ],
                    },
                },
            },
        };
    }

    public async checkJobStatus(groupName: string, id: string, name: string) {
        // ToDo: throw a specific error when failed because OMKilled
        try {
            const { batchV1Client, namespace } =
                this.clientFactory.getClient(groupName);
            const jobName = this.getJobName(id, name);

            return await batchV1Client.readNamespacedJobStatus(
                jobName,
                namespace,
            );
        } catch (error) {
            logger.info(`OpenShiftHelper: Failed on reading job`, {
                groupName,
                id,
                name,
            });

            throw error;
        }
    }

    private getJobName(id: string, name: string) {
        const cleanName = name.replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase();
        return `k6-${cleanName}-${id}`;
    }

    private getCloneUrl(gitlabUrl: string, gitlabToken: string): string {
        const cleanedUrl = gitlabUrl.replace(/^https?:\/\//, '');

        return `https://username:${gitlabToken}@${cleanedUrl}`;
    }

    private getResources(cpu: number, memory: number): V1ResourceRequirements {
        return {
            requests: {
                cpu: (cpu / 4).toString(),
                memory: `${memory}Gi`,
            },
            limits: {
                cpu: cpu.toString(),
                memory: `${memory}Gi`,
            },
        };
    }

    private getEnv(prometheusUrl: string, groupsEnv: V1EnvVar[]): V1EnvVar[] {
        return [
            {
                name: 'K6_PROMETHEUS_RW_INSECURE_SKIP_TLS_VERIFY',
                value: 'true',
            },
            {
                name: 'K6_PROMETHEUS_RW_PUSH_INTERVAL',
                value: '10s',
            },
            {
                name: 'K6_PROMETHEUS_RW_SERVER_URL',
                value: `${prometheusUrl}/api/v1/write`,
            },
            ...groupsEnv,
        ];
    }
}
