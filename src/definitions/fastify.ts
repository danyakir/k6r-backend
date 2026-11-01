import {
    IAuthenticationService,
    IHealthService,
    IResourcesService,
    IScriptsService,
    ISettingsService,
} from './services';

declare module 'fastify' {
    interface FastifyInstance {
        HealthService: IHealthService;
        ResourcesService: IResourcesService;
        ScriptsService: IScriptsService;
        AuthenticationService: IAuthenticationService;
        SettingsService: ISettingsService;
    }

    interface FastifyRequest {
        group: { name: string };
    }
}
