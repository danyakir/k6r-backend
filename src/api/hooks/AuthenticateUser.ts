import { sendCookies } from 'api/utils/sendCookies';
import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { SSOGroups } from '@definitions';
import { BadRequestError, ForbiddenError } from '@errors';
import logger from '@logger';

export const AuthenticateUser: preHandlerHookHandler = async function (
    request: FastifyRequest,
    reply: FastifyReply,
) {
    if (!request.cookies.access_token || !request.cookies.refresh_token) {
        logger.info(`AuthenticateUser: user doent have tokens`);
        return sendUserToLogin(reply);
    }

    let groups = await this.AuthenticationService.authenticateUser(
        request.cookies.access_token,
    );

    if (!groups) {
        const tokenSet = await this.AuthenticationService.refresh(
            request.cookies.refresh_token,
        );

        if (!tokenSet) {
            logger.info(`AuthenticateUser: refresh token was invalid`);
            return sendUserToLogin(reply);
        }

        groups = await this.AuthenticationService.authenticateUser(
            tokenSet.accessToken,
        );

        sendCookies(reply, tokenSet, groups);
    }

    const currentGroup = request.headers['x-current-group'];

    validateCurrentGroup(currentGroup);
    validateGroupInGroups(currentGroup, groups);

    request.group = { name: currentGroup };
};

const validateCurrentGroup: (
    currentGroup: string | string[],
) => asserts currentGroup is string = currentGroup => {
    if (!currentGroup || typeof currentGroup != 'string') {
        logger.error(`AuthenticateUser: header missing group`, {
            currentGroup,
        });

        throw new BadRequestError('Missing header x-current-group');
    }
};

const validateGroupInGroups = (currentGroup: string, groups: SSOGroups) => {
    if (!groups.includes(currentGroup)) {
        logger.error(`AuthenticateUser: user is not in group ${currentGroup}`);

        throw new ForbiddenError(`User cannot access ${currentGroup} group`);
    }
};

const sendUserToLogin = (reply: FastifyReply) => {
    logger.info(`AuthenticateUser: redirecting user to login`);

    return reply.redirect('/oauth/login', StatusCodes.UNAUTHORIZED);
};
