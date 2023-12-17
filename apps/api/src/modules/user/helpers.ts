import { get, isNil, toNumber } from 'lodash';

import { Configure } from '../config/configure';
import { ConfigureFactory, ConfigureRegister } from '../config/types';

import type { UserModuleConfig } from './types';

/**
 * 用户配置创建函数
 * @param register
 */
export const createUserModuleConfig: (
    register: ConfigureRegister<RePartial<UserModuleConfig>>,
) => ConfigureFactory<UserModuleConfig> = (register) => ({
    register,
    defaultRegister: defaultUserConfig,
});

/**
 * 默认用户配置
 */
export const defaultUserConfig = (configure: Configure): UserModuleConfig => {
    return {
        hash: 10,
        jwt: {
            accessTokenSecret: configure.env.get('USER_TOKEN_SECRET', 'access-token-secret'),
            accessTokenExpiresIn: configure.env.get(
                'USER_TOKEN_EXPIRED',
                (v) => toNumber(v),
                3600 * 3,
            ),
            refreshTokenSecret: configure.env.get('USER_REFRESH_TOKEN_SECRET', 'my-refresh-secret'),
            refreshTokenExpiresIn: configure.env.get(
                'USER_REFRESH_TOKEN_EXPIRED',
                (v) => toNumber(v),
                3600 * 24 * 30,
            ),
        },
        super: {
            name: 'timotte',
            password: '123456aA!',
        },
    };
};

export const getUserConfig = async <T>(configure: Configure, key?: string) => {
    const userConfig = await configure.get<UserModuleConfig>('user');
    if (!isNil(key)) return get(userConfig, key) as T;
    return userConfig;
};
