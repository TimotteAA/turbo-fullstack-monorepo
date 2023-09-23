import { Config } from 'meilisearch';

/**
 * 单一meilisearch
 */
export type MeiliSeachOption = Config & { name: string };

/**
 * 模块配置
 */
export type MeiliSeachModuleConfig = MeiliSeachOption[];
