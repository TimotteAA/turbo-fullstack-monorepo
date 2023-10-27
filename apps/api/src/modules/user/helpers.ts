import { ConfigureFactory, ConfigureRegister } from '../config/types';

import { UserModuleConfig } from './types';

export const createUserModuleConfig: (
    register: ConfigureRegister<RePartial<UserModuleConfig>>,
) => ConfigureFactory<UserModuleConfig> = (register) => ({
    register,
    storage: true,
});
