import { isFunction, isNil } from 'lodash';

import { Env } from './env';

import { Storage } from './storage';
import { ConfigStorageOptions, ConfigureFactory, ConfigureRegister } from './types';
import { isAsyncFn } from './utils';

import { deepMerge } from '@timotte-app/utils';

export class Configure {
    /**
     * 是否初始化完成
     */
    protected __inited = false;

    /**
     * 各个模块的配置工厂
     */
    protected factories: Record<string, ConfigureFactory<Record<string, any>>> = {};

    /**
     * 最终的配置对象
     */
    protected config: Record<string, any> = {};

    /**
     * 环境变量操作实例
     */
    protected env: Env;

    /**
     * 存储配置操作实例
     */
    protected storage: Storage;

    get inited() {
        return this.__inited;
    }

    /**
     * 创建Env类，读取环境变量到process.env中
     * 添加各个模块配置的构造器
     */
    async init(configs: Record<string, any> = {}, options: ConfigStorageOptions = {}) {
        if (this.inited) return this;
        this.env = new Env();
        // 读取配置对象
        await this.env.load();
        const { enabled, filePath } = options;
        this.storage = new Storage(enabled, filePath);
        // 同步各个模块的配置构造器
        for (const key in configs) {
            this.add(key, configs[key]);
        }
        await this.sync();
        this.__inited = true;
        return this;
    }

    /**
     * 添加一个模块的配置构造器
     * @param key 某个模块
     * @param register
     */
    add(
        key: string,
        register: ConfigureRegister<Record<string, any>> | ConfigureFactory<Record<string, any>>,
    ) {
        if (!isFunction(register) && 'register' in register) {
            this.factories[key] = register as any;
        } else if (isFunction(register)) {
            this.factories[key] = { register };
        }
        return this;
    }

    /**
     * 使用该方法把某个模块的配置构造器添加到配置集中
     * @param name
     */
    async sync(name?: string) {
        if (!isNil(name)) await this.syncFactory(name);
        else {
            for (const key in this.factories) {
                await this.syncFactory(key);
            }
        }
    }

    protected async syncFactory(name: string) {
        // 配置集中不存在这个配置
        if (!this.factories[name]) return this;
        const { register, defaultRegister, append, storage } = this.factories[name];
        // 默认配置
        let defaultValue = {};
        let value = isAsyncFn(register) ? await register(this) : register(this);
        // 默认register不为空
        if (!isNil(defaultRegister)) {
            defaultValue = isAsyncFn(defaultRegister)
                ? await defaultRegister(this)
                : defaultRegister(this);
            value = deepMerge(defaultValue, value, 'replace');
        }
    }
}
