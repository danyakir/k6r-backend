import { singleton } from 'tsyringe';

import { IHealthService } from '@definitions';
import { ServiceUnavailableError } from '@errors';
import logger from '@logger';
import { HealthResponse } from '@schemas';

import { ResourcesService } from './ResourcesService';

@singleton()
export class HealthService implements IHealthService {
    constructor(private readonly resourcesService: ResourcesService) {}

    public getLiveness(): HealthResponse {
        return { message: "I'm alive! for now..." };
    }

    public async getReadiness(): Promise<HealthResponse> {
        logger.info('HealthService: Checking service resources...');

        const areResourcesAvailable =
            await this.resourcesService.areAllAvailable();

        if (!areResourcesAvailable) {
            logger.error('HealthService: Resources check failed.');

            throw new ServiceUnavailableError();
        }

        return { message: "I'm ready! I'm ready!" };
    }
}
