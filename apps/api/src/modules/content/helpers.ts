import { ConfigureFactory, ConfigureRegister } from '../config/types';

import { ContentConfig } from './types';

export const defaultContentConfig: ContentConfig = { searchType: 'against' };
export const createContentConfig: (
    register: ConfigureRegister<RePartial<ContentConfig>>,
) => ConfigureFactory<ContentConfig> = (register) => ({
    register,
    defaultRegister: () => defaultContentConfig,
});
