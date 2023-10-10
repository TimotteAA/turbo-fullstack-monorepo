import { resolve } from 'path';

import { ensureFileSync, readFileSync, writeFileSync } from 'fs-extra';
import { has, isNil, omit, set } from 'lodash';
import YAML from 'yaml';

/**
 * 将不变的部分配置存储到yml文件中，而不是数据库中
 */
export class Storage {
    /**
     * 是否开启存储功能
     */
    protected _enabled = false;

    /**
     * 放在dist的外面，如果放在dist里，每次都相当于新的config.yml
     */
    protected _path = resolve(__dirname, '../../..', 'config.yml');

    /**
     * config.yml中的配置内容
     */
    protected _config: Record<string, any> = {};

    get enabled() {
        return this._enabled;
    }

    get path() {
        return this._path;
    }

    get config() {
        return this._config;
    }

    /**
     * 初始化存储类，并读取配置文件的内容
     * @param enabled 是否开启存储
     * @param filePath 存储路径
     */
    constructor(enabled?: boolean, filePath?: string) {
        this._enabled = isNil(enabled) ? this.enabled : enabled;
        if (this.enabled) {
            this._path = isNil(filePath) ? this._path : filePath;
            // 确保配置文件存在
            ensureFileSync(this._path);
            const config = YAML.parse(readFileSync(this._path, 'utf-8'));
            this._config = isNil(config) ? {} : config;
        }
    }

    /**
     * 设置存储配置
     * @param key
     * @param value
     */
    set<T>(key: string, value: T) {
        ensureFileSync(this.path);
        set(this._config, key, value);
        writeFileSync(this.path, JSON.stringify(this.path, null, 4));
    }

    /**
     * 删除存储配置
     * @param key
     */
    remove(key: string) {
        this._config = omit(this._config, [key]);
        if (has(this._config, key)) omit(this._config, [key]);
        writeFileSync(this.path, JSON.stringify(this._config, null, 4));
    }
}
