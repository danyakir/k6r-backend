import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';

import {
    AuthenticationService,
    HealthService,
    ResourcesService,
    ScriptsService,
    SettingsService,
} from '@services';

export const injectDependencies = (app: FastifyInstance) => {
    app.decorate('HealthService', container.resolve(HealthService));
    app.decorate('ResourcesService', container.resolve(ResourcesService));
    app.decorate('ScriptsService', container.resolve(ScriptsService));
    app.decorate(
        'AuthenticationService',
        container.resolve(AuthenticationService),
    );
    app.decorate('SettingsService', container.resolve(SettingsService));
};
