// export type UserModuleConfig = {
//     hash: number;
//     jwt: {
//         accessTokenSecret: string;
//         accessTokenExpiresIn: number;
//         refreshTokenSecret: string;
//         refreshTokenExpiresIn: number;
//     };
// };

export type UserModuleConfig = any;

export interface JwtPayload {
    userId: string;
    /** 标识是否退出登录、续期 */
    ssid: string;
    ua: string;
    /** 签发token时间 */
    signAt: number;
}
