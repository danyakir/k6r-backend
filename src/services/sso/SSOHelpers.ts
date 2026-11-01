import { SSOGroups, TokenSet, UserInfo } from '@definitions';
import { ForbiddenError } from '@errors';

function validateUserInfo(value: {
    username?: string;
    groups?: unknown;
}): asserts value is UserInfo {
    validateGroups(value.groups);

    if (!value.username) {
        throw new ForbiddenError(`SSO user has no username`);
    }
}

function validateGroups(groups?: unknown): asserts groups is SSOGroups {
    const _groups = groups as string[];
    if (!_groups || !Array.isArray(_groups) || !(_groups as string[]).length) {
        throw new ForbiddenError(`SSO user doesn't have groups`);
    }
}

function validateTokenSet(value: {
    accessToken?: string;
    refreshToken?: string;
}): asserts value is TokenSet {
    if (!value.accessToken || !value.refreshToken) {
        throw new ForbiddenError(`SSO tokens are invalid`);
    }
}

export { validateUserInfo, validateGroups, validateTokenSet };
