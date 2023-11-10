import { Config } from 'meilisearch';

/**
 * 单一meilisearch
 */
export type MeiliSearchOption = Config & { name: string };

/**
 * 模块配置
 */
export type MeiliSearchModuleConfig = MeiliSearchOption[];
