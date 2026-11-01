import { Prisma } from '@prisma/client';
import { singleton } from 'tsyringe';

import { Script } from '@definitions';
import { BadRequestError } from '@errors';
import { ServiceError } from '@errors';
import logger from '@logger';
import { EditScriptBody } from '@schemas';

import { PostgresClient } from '../PostgresClient';
import { mapScriptEntity } from './ScriptsHelpers';

@singleton()
export class ScriptsRepository {
    constructor(private postgresClient: PostgresClient) {}

    private readonly prismaClient = this.postgresClient.prismaClient;

    public async getScript(scriptId: string): Promise<Script> {
        try {
            const dbScript = await this.prismaClient.scripts.findUniqueOrThrow({
                where: {
                    id: scriptId,
                },
            });

            return mapScriptEntity(dbScript);
        } catch (error) {
            logger.error(`Couldn't find script`, {
                scriptId,
                error,
            });

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new BadRequestError('ScriptId is invalid');
            }

            throw error;
        }
    }

    public async getScripts(groupName: string): Promise<Script[]> {
        const dbScripts = await this.prismaClient.scripts.findMany({
            where: {
                group_name: groupName,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return dbScripts.map(mapScriptEntity);
    }

    public async editScript(
        groupName: string,
        scriptId: string,
        payload: EditScriptBody,
    ) {
        try {
            const [key, value] = Object.entries(payload.diff)[0];

            await this.prismaClient.scripts.update({
                where: { group_name: groupName, id: scriptId },
                data: { [key]: value },
            });
        } catch (error) {
            logger.error(`ScriptsRepository: Couldn't update script`, {
                scriptId,
                groupName,
                error,
            });

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new BadRequestError('ScriptId is invalid');
            }

            throw error;
        }
    }

    public async upsertScriptsFromGit(
        groupName: string,
        gitScripts: string[],
    ): Promise<Script[]> {
        const existingScripts = await this.prismaClient.scripts.findMany({
            where: { group_name: groupName },
        });
        const existingNames = existingScripts.map(script => script.name);
        const newScripts = gitScripts.filter(
            gitScript => !existingNames.includes(gitScript),
        );
        const scriptsToDelete = existingNames.filter(
            existingName => !gitScripts.includes(existingName),
        );

        if (newScripts.length > 0) {
            await this.prismaClient.scripts.createMany({
                data: newScripts.map(name => ({
                    name,
                    group_name: groupName,
                })),
                skipDuplicates: true,
            });
        }

        if (scriptsToDelete.length > 0) {
            await this.prismaClient.scripts.deleteMany({
                where: {
                    group_name: groupName,
                    name: { in: scriptsToDelete },
                },
            });
        }

        return await this.getScripts(groupName);
    }

    public async updateIsScriptRunning(scriptId: string, isRunning: boolean) {
        try {
            await this.prismaClient.scripts.update({
                where: { id: scriptId },
                data: {
                    isRunning,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new ServiceError(
                    `Couldn't update is running script ${scriptId}`,
                );
            }

            throw error;
        }
    }
}
