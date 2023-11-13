import { Ora } from 'ora';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Configure } from '@/modules/config/configure';

import { mockBuilder, resetForeignKey } from '../../helpers';
import { DbMockMaps, Seeder, SeederConstructor, SeederOptions, TypeormOption } from '../../types';

export async function runSeeder(
    Clazz: SeederConstructor,
    args: SeederOptions,
    spinner: Ora,
    configure: Configure,
    dbConfig: TypeormOption,
): Promise<DataSource> {
    const seeder: Seeder = new Clazz(spinner, args);
    const dataSource = new DataSource({ ...dbConfig } as DataSourceOptions);

    await dataSource.initialize();
    const mockMaps: DbMockMaps = {};
    for (const mock of dbConfig.mockMaps) {
        const { entity, handler } = mock();
        mockMaps[entity.name] = { entity, handler };
    }
    if (typeof args.transaction === 'boolean' && !args.transaction) {
        const em = await resetForeignKey(dataSource.manager, dataSource.options.type);
        await seeder.load({
            mock: mockBuilder(configure, dataSource, mockMaps),
            mocks: mockMaps,
            dataSource,
            em,
            configure,
            connection: args.connection ?? 'default',
            ignoreLock: args.ignoreLock,
        });
        await resetForeignKey(em, dataSource.options.type, false);
    } else {
        // 在事务中运行
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const em = await resetForeignKey(queryRunner.manager, dataSource.options.type);
            console.log('mockMaps ', mockMaps);
            await seeder.load({
                mock: mockBuilder(configure, dataSource, mockMaps),
                mocks: mockMaps,
                dataSource,
                em,
                configure,
                connection: args.connection ?? 'default',
                ignoreLock: args.ignoreLock,
            });
            await resetForeignKey(em, dataSource.options.type, false);
            await queryRunner.commitTransaction();
        } catch (error) {
            console.error(Error);
            // 回滚
            await queryRunner.rollbackTransaction();
        } finally {
            // 释放
            await queryRunner.release();
        }
    }
    if (dataSource.isInitialized) await dataSource.destroy();
    return dataSource;
}
