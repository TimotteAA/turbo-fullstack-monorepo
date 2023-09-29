import { isNil } from 'lodash';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

import { getQrderByQuery } from '../helpers';
import { OrderQueryType } from '../types';

/**
 * buildBasicQuery -> buildListQuery -> paginate分页数据
 */
export abstract class BaseRepository<E extends ObjectLiteral> extends Repository<E> {
    /**
     * query-builder中的alias的名称
     */
    protected _alias: string;

    /**
     * @description 默认排序规则，可以通过每个方法的orderBy选项进行覆盖
     * @protected
     * @type {(string | { name: string; order:)}
     */
    protected orderBy?: string | { name: string; order: 'ASC' | 'DESC' };

    get alias() {
        return this._alias;
    }

    /**
     * 构建基础查询器，可以重写，后续的分页查询都是用这个qb
     */
    buildBaseQB() {
        return this.createQueryBuilder(this.alias);
    }

    /**
     * 对查询器排序
     */
    addOrderByQuery(qb: SelectQueryBuilder<E>, orderBy?: OrderQueryType) {
        const order = orderBy ?? this.orderBy;
        return !isNil(order) ? getQrderByQuery(qb, this.alias, order) : qb;
    }
}
