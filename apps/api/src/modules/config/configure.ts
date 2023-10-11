import { get, has, isFunction, isNil, omit, set } from 'lodash';

import { ConfigStorageOptions, ConfigureFactory, ConfigureRegister } from './types';
import { Env } from './env';
import { Storage } from './storage';
import { isAsyncFn, deepMerge } from './utils';

export class Configure {
    /**
     * 是否初始化完成
     */
    protected __inited = false;

    /**
     * 各个模块的配置集
     */
    protected factories: Record<string, ConfigureFactory<Record<string, any>>> = {};

    /**
     * 最终获得的配置对象
     */
    protected config: Record<string, any> = {};

    /**
     * 读取.env的类
     */
    protected _env: Env;

    /**
     * 配置对象存储类
     */
    protected storage: Storage;

    get inited() {
        return this.__inited;
    }

    get env() {
        return this._env;
    }

    async init(configs: Record<string, any> = {}, options: ConfigStorageOptions = {}) {
        if (this.inited) return this;
        this._env = new Env();
        // 先读取配置文件
        await this.env.load();
        const { enabled, filePath } = options;
        this.storage = new Storage(enabled, filePath);
        // 添加各个模块的配置集
        for (const key in configs) {
            this.add(key, configs[key]);
        }
        await this.sync();
        this.__inited = true;
        return this;
    }

    /**
     * 添加某个模块的配置集
     * @param key
     * @param register
     */
    add(
        key: string,
        register: ConfigureRegister<Record<string, any>> | ConfigureFactory<Record<string, any>>,
    ) {
        if (!isFunction(register) && 'register' in register) {
            this.factories[key] = register;
        } else if (isFunction(register)) {
            this.factories[key] = { register };
        }
        return this;
    }

    /**
     * 判断配置是否存在
     * @param key
     */
    has(key: string) {
        return has(this.config, key);
    }

    async sync(name?: string) {
        if (!isNil(name)) await this.syncFactory(name);
        else {
            for (const key in this.factories) {
                await this.syncFactory(key);
            }
        }
    }

    /**
     * 获取配置值
     * @param key
     * @param defaultValue 不存在时返回的默认配置
     */
    async get<T>(key: string, defaultValue?: T): Promise<T> {
        if (!has(this.config, key) && defaultValue === undefined && has(this.factories, key)) {
            // 由于模块的配置读入是随机的，因此需要先读入配置构造器
            await this.syncFactory(key);
            return this.get(key, defaultValue);
        }
        return get(this.config, key, defaultValue) as T;
    }

    /**
     * 设置配置项
     * @param key 配置名
     * @param value 配置值
     * @param storage 是否存储配置
     * @param append 如果为true,则如果已经存在的包含数组的配置,使用追加方式合并,否则直接替换
     */
    async set<T>(key: string, value: T, storage = false, append = false) {
        let rst = value;
        // 根：redis、mysql等
        const rootKey = key.split('.')[0];
        if (has(this.factories, rootKey) && !isNil(this.factories[rootKey].hook)) {
            const { hook } = this.factories[rootKey];
            rst = (isAsyncFn(hook) ? await hook(this, rst) : hook(this, rst)) as T;
        }
        // 需要存储
        if (storage && this.storage.enabled) {
            this.storage.set(key, rst);
            this.config = deepMerge(this.config, this.storage.config, append ? 'merge' : 'replace');
        } else {
            // 直接写到内存里
            set(this.config, key, rst);
        }

        return this;
    }

    /**
     * 删除配置项
     * 如果不是存储配置则为临时删除,重启用户后该配置依然存在
     * @param key
     */
    remove(key: string) {
        if (has(this.storage.config, key) && this.storage.enabled) {
            this.storage.remove(key);
            this.config = deepMerge(this.config, this.storage.config, 'replace');
        } else if (has(this.config, key)) {
            this.config = omit(this.config, [key]);
        }
        return this;
    }

    /**
     * 手动变更一个配置为存储配置
     * @param key
     */
    store(key: string) {
        if (!this.storage.enabled) throw new Error('Must enable storage at first!');
        this.storage.set(key, this.get(key, null));
        this.config = deepMerge(this.config, this.storage.config, 'replace');
        return this;
    }

    protected async syncFactory(name: string) {
        // 配置集中不存在这个配置
        if (!this.factories[name]) return this;
        const { register, defaultRegister, storage, append } = this.factories[name];
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
        this.set(name, value, storage && isNil(await this.get(name, null)), append);
        return this;
    }
}
