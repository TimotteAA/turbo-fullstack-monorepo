export type UserModuleConfig = {
    hash: number;
    jwt: {
        accessTokenSecret: string;
        accessTokenExpiresIn: number;
        refreshTokenSecret: string;
        refreshTokenExpiresIn: number;
    };
};

export interface JwtPayload {
    userId: string;
    /** 标识是否退出登录、续期 */
    ssid: string;
    ua: string;
}
