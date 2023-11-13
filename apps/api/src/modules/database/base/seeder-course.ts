import { isNil } from 'lodash';
import { Ora } from 'ora';
import { DataSource, EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/utils';

import { mockBuilder } from '../helpers';
import {
    DbConfig,
    DbMock,
    DbMockOption,
    Seeder,
    SeederConstructor,
    SeederLoadParams,
    SeederOptions,
} from '../types';

/**
 * 数据填充基类
 */
export abstract class BaseSeeder implements Seeder {
    protected dataSource: DataSource;

    protected em: EntityManager;

    protected connection = 'default';

    protected configure: Configure;

    protected ignoreLock = false;

    // protected

    protected mocks!: {
        [entityName: string]: DbMockOption<any, any>;
    };

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

        const result = await this.run(mock, this.dataSource);
        return result;
    }

    protected async getDbConfig() {
        const { connections = [] }: DbConfig = await this.configure.get<DbConfig>('database');
        const dbConfig = connections.find(({ name }) => name === this.connection);
        if (isNil(dbConfig)) panic(`Database connection named ${this.connection} not exists!`);
        return dbConfig;
    }

    /**
     * 运行seeder的关键方法
     * @param factorier
     * @param dataSource
     * @param em
     */
    protected abstract run(
        factorier?: DbMock,
        dataSource?: DataSource,
        em?: EntityManager,
    ): Promise<any>;

    /**
     * 运行子seeder
     *
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
