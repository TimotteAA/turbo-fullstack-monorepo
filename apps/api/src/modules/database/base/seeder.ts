import { resolve } from 'path';

import { Type } from '@nestjs/common';
import { ensureFileSync, readFileSync, writeFileSync } from 'fs-extra';
import { get, isNil, set } from 'lodash';
import { Ora } from 'ora';
import { DataSource, EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';
import * as YAML from 'yaml';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/utils';

import { mockBuilder } from '../helpers';
import {
    DbMock,
    DbMockOption,
    DbOptions,
    Seeder,
    SeederConstructor,
    SeederLoadParams,
    SeederOptions,
} from '../types';

export class BaseSeeder implements Seeder {
    protected dataSource: DataSource;

    protected em: EntityManager;

    protected connection = 'default';

    protected configure: Configure;

    protected ignoreLock = false;

    protected mocks!: {
        [entityName: string]: DbMockOption<any, any>;
    };

    /**
     * 清空的表结构
     */
    protected truncates: EntityTarget<ObjectLiteral>[] = [];

    constructor(
        protected readonly spinner: Ora,
        protected readonly args: SeederOptions,
    ) {}

    /**
     * 清空原数据并重新加载数据
     * @param params
     */
    async load(params: SeederLoadParams): Promise<any> {
        const { mock, mocks, dataSource, em, connection, configure, ignoreLock } = params;
        this.connection = connection;
        this.dataSource = dataSource;
        this.em = em;
        this.mocks = mocks;
        this.configure = configure;
        this.ignoreLock = ignoreLock;
        if (this.ignoreLock) {
            for (const truncate of this.truncates) {
                await this.em.clear(truncate);
            }
        }
        const result = await this.run(mock, this.dataSource, this.em);
        return result;
    }

    protected async getDbConfig() {
        const { connections = [] } = await this.configure.get<DbOptions>('database');
        const dbConfig = connections.find(({ name }) => name === this.connection);
        if (isNil(dbConfig)) panic(`Database connection named ${this.connection} does not exists!`);
        return dbConfig;
    }

    /**
     * 运行seeder的关键方法
     * @param mock
     * @param dataSource
     * @param em
     */

    /**
     * 运行一个连接的填充类，BaseSeeder中仅会对unlock的类进行运行
     */
    protected async run(_mock: DbMock, _dataSource: DataSource, _em: EntityManager): Promise<any> {
        this.dataSource = _dataSource;
        this.em = _em;

        // 配置的各个数据填充类
        let seeders: Type<any>[] = ((await this.getDbConfig()) as any).seeders ?? [];
        if (!this.ignoreLock) {
            const seedLockFile = resolve(__dirname, '../../../..', 'seed-lock.yml');
            ensureFileSync(seedLockFile);
            const yml = YAML.parse(readFileSync(seedLockFile, 'utf-8'));
            const locked = isNil(yml) ? {} : yml;
            const lockNames = get<string[]>(locked, this.connection, []).reduce<string[]>(
                (o, n) => (o.includes(n) ? o : [...o, n]),
                [],
            );
            seeders = seeders.filter((s) => !lockNames.includes(s.name));

            for (const seeder of seeders) {
                await this.call(seeder);
            }
            // 加入到locked中
            set(locked, this.connection, [
                ...lockNames.filter((n) => !isNil(n)),
                ...seeders.map((s) => s.name).filter((n) => !isNil(n)),
            ]);
            writeFileSync(seedLockFile, JSON.stringify(locked, null, 4));
        } else {
            for (const seeder of seeders) {
                await this.call(seeder);
            }
        }
    }

    /**
     * 运行子seeder
     * @param SubSeeder
     */
    protected async call(SubSeeder: SeederConstructor) {
        const subSeeder: Seeder = new SubSeeder(this.spinner, this.args);
        await subSeeder.load({
            connection: this.connection,
            mock: mockBuilder(this.configure, this.dataSource, this.mocks),
            mocks: this.mocks,
            dataSource: this.dataSource,
            em: this.em,
            configure: this.configure,
            ignoreLock: this.ignoreLock,
        });
    }
}
