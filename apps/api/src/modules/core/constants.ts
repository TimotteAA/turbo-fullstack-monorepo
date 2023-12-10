import { toNumber } from 'lodash';

import { Configure } from '../config/configure';

import { toBoolean } from './utils';

export const DTO_VALIDATION_OPTIONS = 'dto_validation_options';

/**
 * 默认应用配置
 * @param configure
 */
export const getDefaultAppConfig = (configure: Configure) => ({
    host: configure.env.get('APP_HOST', '127.0.0.1'),
    port: configure.env.get('APP_PORT', (v) => toNumber(v), 3100),
    https: configure.env.get('APP_SSL', (v) => toBoolean(v), false),
    timezone: configure.env.get('APP_TIMEZONE', 'Asia/Shanghai'),
    locale: configure.env.get('APP_LOCALE', 'zh_CN'),
    name: configure.env.get('APP_NAME', 'main'),
    limit: {
        // 1分钟100个请求
        interval: configure.env.get('APP_LIMIT_INTERVAL', (v) => toNumber(v), 60 * 1000),
        rate: configure.env.get('APP_LIMIT_RATE', (v) => toNumber(v), 100),
    },
});
