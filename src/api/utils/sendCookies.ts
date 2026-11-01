import { FastifyReply } from 'fastify';

import { CookieKeys, SSOGroups, TokenSet } from '@definitions';

export const sendCookies = (
    reply: FastifyReply,
    { accessToken, refreshToken }: TokenSet,
    groups?: SSOGroups,
) => {
    reply
        .setCookie(CookieKeys.ACCESS_TOKEN, accessToken, { httpOnly: true })
        .setCookie(CookieKeys.REFRESH_TOKEN, refreshToken, { httpOnly: true })
        .setCookie(CookieKeys.GROUPS, JSON.stringify(groups));
};
