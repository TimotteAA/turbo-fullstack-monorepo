export type UserModuleConfig = {
    hash: number;
    jwt: {
        accessTokenSecret: string;
        accessTokenExpiresIn: number;
        refreshTokenSecret: string;
        refreshTokenExpiresIn: number;
    };
};
