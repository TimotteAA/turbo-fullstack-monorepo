import { AbilityTuple, MongoAbility, MongoQuery, RawRuleFrom } from '@casl/ability';
import { ModuleRef } from '@nestjs/core';
import { FastifyRequest as Request } from 'fastify';

import { UserEntity } from '../user/entities';
import { UserRepository } from '../user/repositorys';

import { ResourceEntity, RoleEntity } from './entities';
import { RbacResolver } from './rbac.resolver';

export type PermissionChecker = (
    ability: MongoAbility,
    ref?: ModuleRef,
    request?: Request,
) => Promise<boolean>;

export type Role = Pick<ClassToPlain<RoleEntity>, 'name' | 'label'> & {
    resources: string[];
};
export type ResourceType<A extends AbilityTuple, C extends MongoQuery> = Pick<
    ClassToPlain<ResourceEntity<A, C>>,
    | 'name'
    | 'type'
    | 'component'
    | 'path'
    | 'icon'
    | 'keepAlive'
    | 'external'
    | 'status'
    | 'show'
    | 'customOrder'
> &
    Partial<Pick<ClassToPlain<ResourceEntity<A, C>>, 'label' | 'description'>> & {
        rule?: Omit<RawRuleFrom<A, C>, 'conditions'> & {
            conditions?: (user: ClassToPlain<UserEntity>) => Record<string, any>;
        };
        children?: ResourceType<A, C>[];
        parent?: string;
    };
export type CheckerParams = {
    resolver: RbacResolver;
    repository: UserRepository;
    checkers: PermissionChecker[];
    moduleRef?: ModuleRef;
    request?: any;
};

export type Route = {
    id: string;
    path: string;
    name: string;
    component: string;
    meta?: {
        name: string;
        icon: string;
        ignoreKeepAlive?: boolean;
        hide?: boolean;
    };
    redirect?: string;
    children?: Route[];
};
