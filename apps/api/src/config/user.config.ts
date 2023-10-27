import { createUserModuleConfig } from '@/modules/user/helpers';

export const user = createUserModuleConfig((configure) => ({
    hash: 10,
    jwt: {
        accessTokenSecret: configure.env.get('ACCESS_TOKEN_SECRET', 'asdada'),
        accessTokenExpiresIn: configure.env.get('ACCESS_TOKEN_EXPIRES_IN', 60 * 60 * 60),
        refreshTokenSecret: configure.env.get('REFRESH_TOKEN_SECRET', 'asdzxcassx'),
        refreshTokenExpiresIn: configure.env.get(
            'REFRESH_TOKEN)EXPIRES_IN',
            60 * 60 * 60 * 60 * 60,
        ),
    },
}));