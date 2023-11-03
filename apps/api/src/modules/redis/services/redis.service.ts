import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisType } from 'ioredis';
import { isNil } from 'lodash';

import { RedisOption } from '../types';
// import chalk from "chalk";

/**
 * redis连接，支持多个redis实例
 */
@Injectable()
export class RedisService {
    private clients: Map<string, RedisType> = new Map();

    constructor(private config: RedisOption) {}

    async createClients() {
        // this.config.connections.forEach(async (o: RedisOption) => {
        // try {
        //     const client = new Redis(o.connectOptions);
        //     this.clients.set(o.name, client);
        // } catch (err) {
        //     console.error('err ', err);
        // }
        // });
        for (const [name, config] of Object.entries(this.config)) {
            try {
                const client = new Redis(config);
                this.clients.set(name, client);
            } catch (err) {
                console.error('err ', err);
            }
        }
    }

    getClients() {
        return this.clients;
    }

    /**
     * 获取redis链接
     * 不传获取默认链接
     * @param name
     */
    getClient(name?: string) {
        let key = 'default';
        if (!isNil(name)) key = name;
        if (!this.clients.has(key)) {
            throw new Error(`client ${key} does not exist`);
        }
        return this.clients.get(key);
    }
}
