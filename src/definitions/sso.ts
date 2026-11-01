export type SSOUser = {
    tokenSet: TokenSet;
    userInfo: UserInfo;
};

export type UserInfo = {
    username: string;
    groups: SSOGroups;
};

export type SSOGroups = string[];

export type TokenSet = {
    accessToken: string;
    refreshToken: string;
};
