import { injectable } from 'tsyringe';

import {
    IAuthenticationService,
    SSOGroups,
    SSOUser,
    TokenSet,
} from '@definitions';
import { AuthCallbackQuery } from '@schemas';
import { GroupsRepository } from '@postgres';

import { SSOClient } from './sso/SSOClient';

@injectable()
export class AuthenticationService implements IAuthenticationService {
    constructor(
        private ssoClient: SSOClient,
        private groupsRepository: GroupsRepository,
    ) {}

    public generateAuthenticationUrl(): string {
        return this.ssoClient.getAuthenticationUrl();
    }

    public async handleAuthenticationCallback(
        query: AuthCallbackQuery,
    ): Promise<SSOUser> {
        const ssoUser = await this.ssoClient.handleCallback(query);
        await this.groupsRepository.addGroupsIfMissing(ssoUser.userInfo.groups);

        return ssoUser;
    }

    public async authenticateUser(access_token: string): Promise<SSOGroups> {
        return await this.ssoClient.authenticateUser(access_token);
    }

    public async refresh(refresh_token: string): Promise<TokenSet> {
        return await this.ssoClient.refreshToken(refresh_token);
    }
}
