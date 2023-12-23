import { MongoAbility } from '@casl/ability';
import { FastifyRequest as Request } from 'fastify';
import { isNil } from 'lodash';
import { ObjectLiteral } from 'typeorm';

import { PermissionAction } from '../constants';

/**
 * 验证待操作的entity，是否是用户自身创建的
 * @param ability
 * @param options
 */
export const checkOwnerPermission = async <E extends ObjectLiteral>(
    ability: MongoAbility,
    options: {
        request: Request;
        key?: string;
        /**
         * 从数据库中查找entities
         * @param ids
         */
        getData: (ids: string[]) => Promise<E[]>;
        permission?: string;
    },
) => {
    const { request, key, getData, permission } = options;
    const models = await getData(getRequestIds(key, request));
    return models.every((model) => ability.can(permission ?? PermissionAction.OWNER, model));
};

/**
 * 从param或body中拿到ids数组
 * @param request
 */
export const getRequestIds = (key?: string, request?: Request): string[] => {
    const { params = {}, body = {} } = (request ?? {}) as any;
    if (!isNil(key)) {
        const requestValue = params[key] ?? body[key];
        if (isNil(requestValue)) return [];
        return Array.isArray(requestValue) ? requestValue : [requestValue];
    }
    // 单个id，param或者body里传
    const id = params.id ?? body.id ?? params.item ?? body.item;
    const { ids } = body;
    if (!isNil(id)) return [id];
    return !isNil(ids) && Array.isArray(ids) ? ids : [];
};
