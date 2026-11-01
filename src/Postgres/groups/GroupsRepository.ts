import { Prisma } from '@prisma/client';
import { injectable } from 'tsyringe';

import { SSOGroups, ValidatedGroup } from '@definitions';
import { BadRequestError } from '@errors';
import logger from '@logger';
import { Settings } from '@schemas';
import { security } from '@utils';

import { PostgresClient } from '../PostgresClient';
import { mapGroupEntity, validateGroup } from './GroupsHelpers';

@injectable()
export class GroupsRepository {
    constructor(private postgresClient: PostgresClient) {}

    private readonly prismaClient = this.postgresClient.prismaClient;

    public async addGroupsIfMissing(groups: SSOGroups) {
        await this.prismaClient.groups.createMany({
            data: groups.map(name => ({
                name,
            })),
            skipDuplicates: true,
        });
    }

    public async getSettings(groupName: string): Promise<Settings> {
        try {
            const dbGroup = await this.prismaClient.groups.findUniqueOrThrow({
                where: {
                    name: groupName,
                },
            });

            const { id, name, ...settings } = mapGroupEntity(dbGroup);

            return settings;
        } catch (error) {
            logger.error(`GroupsRepository: Couldn't find group`, {
                groupName,
                error,
            });

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new BadRequestError(`Group name is invalid`);
            }

            throw error;
        }
    }

    public async getValidatedGroup(groupName: string): Promise<ValidatedGroup> {
        const dbGroup = await this.prismaClient.groups.findFirst({
            where: {
                name: groupName,
            },
        });

        return validateGroup(dbGroup);
    }

    public async editGroup(groupName: string, settings: Settings) {
        try {
            const normalizedSettings = {
                ...settings,
                ocToken: settings.ocToken
                    ? security.encrypt(settings.ocToken)
                    : null,
                gitlabToken: settings.gitlabToken
                    ? security.encrypt(settings.gitlabToken)
                    : null,
            };

            await this.prismaClient.groups.update({
                where: { name: groupName },
                data: normalizedSettings,
            });
        } catch (error) {
            logger.error(`GroupsRepository: Couldn't update group`, {
                groupName,
                error,
            });

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new BadRequestError('Group name is invalid');
            }

            throw error;
        }
    }
}
