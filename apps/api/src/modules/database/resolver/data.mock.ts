import { isPromise } from 'util/types';

import { isNil } from 'lodash';
import { EntityManager, EntityTarget } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/utils';

import { DbMockHandler, MockOverride } from '../types';

/**
 * 一个实体entity的mocker，用于创建单个、多个数据
 * 创建的数据可以保存，也可以不保存
 */
export class DataMock<Entity, Settings> {
    private mapFunction!: (entity: Entity) => Promise<Entity>;

    constructor(
        public name: string,
        public configure: Configure,
        public entity: EntityTarget<Entity>,
        protected em: EntityManager,
        protected mock: DbMockHandler<Entity, Settings>,
        protected settings: Settings,
    ) {}

    /**
     * Entity映射
     * 用于一个Entity类绑定其他实现函数，刺齿Entity只作为一个键名
     * @param mapFunction
     */
    map(mapFunction: (entity: Entity) => Promise<Entity>): DataMock<Entity, Settings> {
        this.mapFunction = mapFunction;
        return this;
    }

    /**
     * 创建模拟数据，但不存储
     * @param overrideParams
     */
    async make(overrideParams: MockOverride<Entity> = {}): Promise<Entity> {
        if (this.mock) {
            let entity: Entity = await this.resolveEntity(
                // 先创建一个entity，然后解析
                await this.mock(this.configure, this.settings),
            );
            // 额外的映射函数
            if (this.mapFunction) entity = await this.mapFunction(entity);
            // 修改额外字段
            for (const key in overrideParams) {
                if (overrideParams[key]) {
                    entity[key] = overrideParams[key];
                }
            }
            return entity;
        }
        throw new Error('Cound not found entity');
    }

    /**
     * 创建模拟数据并保存
     * @param overrideParams 覆盖entity某些字段
     * @param existsCheck 唯一性检查字段，仅当数据库中不存在时才保存
     */
    async create(overrideParams: MockOverride<Entity> = {}, existsCheck?: string): Promise<Entity> {
        try {
            const entity = await this.make(overrideParams);
            if (!isNil(existsCheck)) {
                const repo = this.em.getRepository(this.entity);
                const value = (entity as any)[existsCheck];
                if (!isNil(value)) {
                    const item = await repo.findOneBy({ [existsCheck]: value } as any);
                    if (isNil(item)) return await this.em.save(entity);
                    return item;
                }
            }
            return await this.em.save(entity);
        } catch (error) {
            const message = 'Could not save entity';
            panic({ message, error });
            throw new Error(message);
        }
    }

    /**
     * 创建多条模拟数据但不存储
     * @param amount
     * @param overrideParams
     */
    async makeMany(amount: number, overrideParams: MockOverride<Entity> = {}): Promise<Entity[]> {
        const list = [];
        for (let i = 0; i < amount; i++) {
            list[i] = await this.make(overrideParams);
        }
        return list;
    }

    async createMany(
        amount: number,
        overrideParams: MockOverride<Entity> = {},
        existsCheck?: string,
    ) {
        const list = [];
        for (let i = 0; i < amount; i++) {
            list[i] = await this.create(overrideParams, existsCheck);
        }
        return list;
    }

    /**
     * 解析mock函数生成的fake entity
     * @param entity
     */
    protected async resolveEntity(entity: Entity): Promise<Entity> {
        for (const attribute in entity) {
            if (entity[attribute]) {
                if (isPromise(entity[attribute])) {
                    // promise惰性加载属性
                    entity[attribute] = await Promise.resolve(entity[attribute]);
                }

                // entity的字段是个对象
                if (typeof entity[attribute] === 'object' && !(entity[attribute] instanceof Date)) {
                    const subEntityMock = entity[attribute];
                    try {
                        if (typeof (subEntityMock as any).make === 'function') {
                            entity[attribute] = await (subEntityMock as any).make();
                        }
                    } catch (error) {
                        const message = `Could not make ${(subEntityMock as any).name}`;
                        panic({ message, error });
                        throw new Error(message);
                    }
                }
            }
        }
        return entity;
    }
}
