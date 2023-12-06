export interface UserModuleConfig {
    hash: number;
    jwt: {
        accessTokenSecret: string;
        accessTokenExpiresIn: number;
        refreshTokenSecret: string;
        refreshTokenExpiresIn: number;
    };
}

// export type UserModuleConfig = any;

// /**
//  * 用户模块配置
//  */
// export interface UserConfig {
//     hash: number;
//     jwt: JwtConfig;
// }

// /**
//  * JWT配置
//  */
// export interface JwtConfig {
//     secret: string;
//     token_expired: number;
//     refresh_secret: string;
//     refresh_token_expired: number;
// }

export interface JwtPayload {
    userId: string;
    /** 标识是否退出登录、续期 */
    ssid: string;
    ua: string;
    /** 签发token时间 */
    signAt: number;
}
