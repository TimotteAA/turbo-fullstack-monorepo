import { resolve } from 'path';

import { isNil, toNumber } from 'lodash';

import type { ConfigureFactory, ConfigureRegister } from '../config/types';
import { toBoolean } from '../core/utils';

import type { SmtpClientConfig } from './types';

export const createSmtpConfig: (
    register: ConfigureRegister<Partial<SmtpClientConfig>>,
) => ConfigureFactory<Partial<SmtpClientConfig>> = (register) => ({
    register,
    defaultRegister: (configure) => {
        const config: SmtpClientConfig = {
            host: configure.env.get('SMTP_HOST', 'your-smtp-host'),
            user: configure.env.get('SMTP_USER', 'your-smtp-username'),
            password: configure.env.get('SMTP_PASSWORD', 'your-smtp-password'),
            secure: configure.env.get<boolean>('SMTP_SECURE', (v) => toBoolean(v), false),
            from: configure.env.get('SMTP_FROM', undefined),
            // Email模板路径
            resource: resolve(__dirname, '../../../assets/emails'),
        };
        if (isNil(config.from)) config.from = configure.env.get('SMTP_FROM', config.user);
        config.port = config.secure
            ? configure.env.get<number>('SMTP_PORT', (v) => toNumber(v), 443)
            : configure.env.get<number>('SMTP_PORT', (v) => toNumber(v), 25);
        return config;
    },
    storage: true,
});
