import { Injectable } from '@nestjs/common';

import MeiliSearch from 'meilisearch';

import type { MeiliSeachModuleConfig } from '../types';

@Injectable()
export class MeiliSearchService {
    private clients: Map<string, MeiliSearch> = new Map();

    constructor(protected config: MeiliSeachModuleConfig) {}

    getClient(key?: string) {
        let name = 'default';
        if (key) name = key;

        if (!this.clients.has(name)) {
            throw new Error(`meilisearch instance ${name} does not exist`);
        }
        return this.clients.get(name);
    }

    /**
     * 获得全部客户端
     */
    getClients() {
        return this.clients;
    }

    getConfig() {
        return this.config;
    }

    /**
     * 初始化各个链接
     */
    async initClients() {
        console.log('this.config ', this.config);
        this.config.forEach(({ name, ...config }) => {
            const client = new MeiliSearch(config);
            this.clients.set(name, client);
        });
    }
}
