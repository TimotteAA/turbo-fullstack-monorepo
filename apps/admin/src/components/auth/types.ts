export interface IAuth extends Record<string, any> {
    username: string;
    permissions: string[];
}

export interface AuthConfig {
    /** 获取用户详情的api url */
    api: string;
    error?: () => void;
}
