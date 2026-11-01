import configuration from 'configuration';
import { Issuer, BaseClient } from 'openid-client';
import { singleton } from 'tsyringe';

import { IResource, SSOGroups, SSOUser, TokenSet } from '@definitions';
import { ServiceError, ForbiddenError } from '@errors';
import logger from '@logger';
import { AuthCallbackQuery } from '@schemas';
import { bubbleUpKnownError } from '@utils';

import {
    validateGroups,
    validateUserInfo,
    validateTokenSet,
} from './SSOHelpers';

const {
    providerUrl,
    clientId: client_id,
    clientSecret: client_secret,
    redirectURI: redirect_uri,
} = configuration.AUTHENTICATION.SSO;

@singleton()
export class SSOClient implements IResource {
    private client?: BaseClient;

    get name() {
        return 'SSOClient';
    }

    constructor() {}

    private ensureConnected(client?: BaseClient): asserts client is BaseClient {
        if (!client) {
            throw new ServiceError('Server Is not connected to sso');
        }
    }

    async connect(): Promise<void> {
        const issuer = await this.discoverIssuer();

        this.client = new issuer.Client({
            client_id,
            client_secret,
            redirect_uri: [redirect_uri],
        });

        logger.info(`SSOClient: connected to sso`);
    }

    private async discoverIssuer() {
        try {
            return await Issuer.discover(providerUrl);
        } catch (error) {
            logger.error(`SSOClient: failed to discover client ${error}`);

            throw new ServiceError(`Couldn't discover client`);
        }
    }

    public async quit() {
        this.client = undefined;
        logger.info(`SSOClient: disconnected from sso`);
    }

    public async isAvailable() {
        try {
            this.ensureConnected(this.client);
            await this.discoverIssuer();

            return true;
        } catch (error) {
            logger.error(`SSOClient: Client isn't available ${error}`);

            return false;
        }
    }

    public getAuthenticationUrl(): string {
        try {
            this.ensureConnected(this.client);

            return this.client.authorizationUrl({
                redirect_uri,
                scope: 'openid groups',
            });
        } catch (error) {
            bubbleUpKnownError(error);

            logger.error(
                `SSOClient: failed to create authentication url ${error}`,
            );

            throw new ServiceError(`failed to create authentication url`);
        }
    }

    public async handleCallback(query: AuthCallbackQuery): Promise<SSOUser> {
        try {
            this.ensureConnected(this.client);

            const { access_token, refresh_token } = await this.client.callback(
                redirect_uri,
                query,
            );
            const claims = await this.client.introspect(access_token);

            if (!claims.active) {
                throw new ForbiddenError(`SSO user not active`);
            }

            validateUserInfo(claims);

            return {
                tokenSet: {
                    accessToken: access_token,
                    refreshToken: refresh_token,
                },
                userInfo: { username: claims.username, groups: claims.groups },
            };
        } catch (error) {
            bubbleUpKnownError(error);

            logger.error(`SSOClient: failed to handle callback ${error}`);

            throw new ForbiddenError('SSO authentication failed');
        }
    }

    public async authenticateUser(access_token: string): Promise<SSOGroups> {
        try {
            this.ensureConnected(this.client);

            const userInfo = await this.client.userinfo(access_token);
            validateGroups(userInfo.groups);

            return userInfo.groups;
        } catch (error) {
            bubbleUpKnownError(error);

            logger.debug(`SSOClient: access_token is invalid`);
        }
    }

    public async refreshToken(refreshToken: string): Promise<TokenSet> {
        try {
            this.ensureConnected(this.client);

            const { access_token, refresh_token } = await this.client.refresh(
                refreshToken,
            );
            validateTokenSet({
                accessToken: access_token,
                refreshToken: refresh_token,
            });

            return {
                accessToken: access_token,
                refreshToken: refresh_token,
            };
        } catch (error) {
            bubbleUpKnownError(error);

            logger.debug(`SSOClient: failed to refresh tokens ${error}`);
        }
    }
}
