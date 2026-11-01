import { $Enums } from '@prisma/client';
import { injectable } from 'tsyringe';

import { Execution } from '@definitions';
import { BadRequestError, ServiceError } from '@errors';
import logger from '@logger';

import { PostgresClient } from '../PostgresClient';
import { mapHistoryEntity } from './HistoryHelpers';

@injectable()
export class HistoryRepository {
    constructor(private postgresClient: PostgresClient) {}

    private readonly prismaClient = this.postgresClient.prismaClient;

    public async getHistory(groupName: string): Promise<Execution[]> {
        const executionsDb = await this.prismaClient.history.findMany({
            where: {
                group_name: groupName,
            },
            orderBy: {
                startTime: 'desc',
            },
        });

        return executionsDb.map(mapHistoryEntity);
    }

    public async createExecution(
        id: string,
        name: string,
        groupName: string,
    ): Promise<Execution> {
        const executionDb = await this.prismaClient.history.create({
            data: {
                id,
                name,
                group_name: groupName,
                status: 'running',
            },
        });
        return mapHistoryEntity(executionDb);
    }

    public async updateScriptStatus(id: string, status: $Enums.status_enum) {
        try {
            await this.prismaClient.history.update({
                where: { id },
                data: { status, endTime: new Date() },
            });
        } catch {
            logger.error(`HistoryRepository: Couldn't update history ${id}`);

            throw new ServiceError(
                `Couldn't update history ${id} with status ${status}`,
            );
        }
    }

    public async getRunningScript(
        name: string,
        groupName: string,
    ): Promise<Execution> {
        const executionDb = await this.prismaClient.history.findFirst({
            where: { name, status: 'running', group_name: groupName },
            orderBy: { startTime: 'desc' },
        });

        if (!executionDb) {
            throw new BadRequestError(`${name} is not currently running`);
        }

        return mapHistoryEntity(executionDb);
    }
}
