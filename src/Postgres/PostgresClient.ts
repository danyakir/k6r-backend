import { PrismaClient } from '@prisma/client';
import { singleton } from 'tsyringe';

import { IResource } from '@definitions';
import { ServiceError } from '@errors';
import logger from '@logger';

@singleton()
export class PostgresClient implements IResource {
    private readonly prisma = new PrismaClient();

    get name() {
        return 'PostgresClient';
    }

    get prismaClient(): PrismaClient {
        if (this.isAvailable) {
            return this.prisma;
        }

        logger.error(`PostgresClient: Prisma Client isnt connected`);

        throw new ServiceError('Prisma Client isnt connected');
    }

    public async connect(): Promise<void> {
        await this.prisma.$connect();
        logger.info(`PostgresClient: connected to db`);
    }

    public async quit(): Promise<void> {
        await this.prisma.$disconnect();
        logger.info(`PostgresClient: disconnected from db`);
    }

    public async isAvailable(): Promise<boolean> {
        try {
            return await this.prisma.$queryRaw`SELECT 1`;
        } catch (error) {
            logger.error(`PostgresClient: Client isn't available`, { error });

            return false;
        }
    }
}
