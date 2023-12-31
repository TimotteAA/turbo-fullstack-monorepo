export interface UserModuleConfig {
    hash: number;
    jwt: {
        accessTokenSecret: string;
        accessTokenExpiresIn: number;
        refreshTokenSecret: string;
        refreshTokenExpiresIn: number;
    };
    /** 超级管理员的账户和密码 */
    super: {
        name: string;
        password: string;
    };
}

export interface JwtPayload {
    userId: string;
    /** 标识是否退出登录、续期 */
    ssid: string;
    ua: string;
    /** 签发token时间 */
    signAt: number;
}
