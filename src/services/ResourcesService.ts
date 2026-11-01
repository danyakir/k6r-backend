import { singleton } from 'tsyringe';

import { IResource, IResourcesService } from '@definitions';
import { PostgresClient } from '@postgres';

import { SSOClient } from './sso/SSOClient';

@singleton()
export class ResourcesService implements IResourcesService {
    private readonly resources: IResource[];

    constructor(postgresClient: PostgresClient, ssoClient: SSOClient) {
        this.resources = [postgresClient, ssoClient];
    }

    public async connectAll() {
        await Promise.all(this.resources.map(resource => resource.connect()));
    }

    public async quitAll() {
        await Promise.all(
            this.resources.map(resource =>
                resource.quit().catch(error => {
                    console.error(`Error quitting resource ${resource.name}`, {
                        error,
                    });
                }),
            ),
        );
    }

    public async areAllAvailable() {
        const resourcesAvailability = await Promise.all(
            this.resources.map(resource => resource.isAvailable()),
        );
        return resourcesAvailability.every(isAvailable => isAvailable);
    }
}
