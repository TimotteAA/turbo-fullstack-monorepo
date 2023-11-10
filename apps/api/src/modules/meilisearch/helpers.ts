import { createConnectionOptions } from '../config/helpers';
import { ConfigureFactory, ConfigureRegister } from '../config/types';

import { MeiliSearchModuleConfig } from './types';

export const createMeiliSearchModuleConfig = async (options: MeiliSearchModuleConfig) => {
    if (options.length < 0) return options;
    let config = options;
    const names = config.map(({ name }) => name);
    // 不包含默认default配置
    if (!names.includes('default')) config[0].name = 'default';
    else if (names.filter((name) => name === 'default').length > 0) {
        config = config.reduce(
            // 仅保留一个default配置
            (o, n) => (o.map(({ name }) => name).includes('default') ? o : [...o, n]),
            [],
        );
    }
    return config;
};

export const createMeilliConfig: (
    register: ConfigureRegister<RePartial<MeiliSearchModuleConfig>>,
) => ConfigureFactory<MeiliSearchModuleConfig, MeiliSearchModuleConfig> = (register) => ({
    register,
    hook: (_configure, value) => createConnectionOptions(value),
});
