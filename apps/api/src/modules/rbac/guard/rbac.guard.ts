import { createMongoAbility } from '@casl/ability';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { isNil } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { JwtAuthGuard } from '@/modules/user/guards';
import { UserRepository } from '@/modules/user/repositorys';
import { AuthService } from '@/modules/user/services';

import { PERMISSION_CHECKERS } from '../constants';
import { ResourceEntity } from '../entities';
import { RbacResolver } from '../rbac.resolver';
import { PermissionChecker } from '../types';

@Injectable()
export class RbacGuard extends JwtAuthGuard {
    constructor(
        protected authService: AuthService,
        protected reflector: Reflector,
        protected resolver: RbacResolver,
        protected userRepo: UserRepository,
        protected moduleRef: ModuleRef,
    ) {
        super(authService, reflector);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // jwt校验
        const authCheck = await super.canActivate(context);
        console.log('authCheck');
        const request = context.switchToHttp().getRequest();
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        console.log('wtf 22 ', authCheck);
        if (!authCheck) return false;
        console.log('www');
        // 匿名接口
        if (authCheck && isNil(requestToken)) return true;
        // 定义在接口上的权限
        const checkers = getCheckers(context, this.reflector);
        if (isNil(checkers) || !checkers.length) return true;
        console.log('checkers ', checkers);
        return checkPermissions({
            resolver: this.resolver,
            userRepo: this.userRepo,
            moduleRef: this.moduleRef,
            request,
            checkers,
        });
    }
}

const getCheckers = (context: ExecutionContext, reflector: Reflector) => {
    // crud接口上的权限
    const crudCheckers = Reflect.getMetadata(
        PERMISSION_CHECKERS,
        context.getClass().prototype,
        context.getHandler().name,
    ) as PermissionChecker[];
    // 普通接口定义的权限
    const defaultCheckers = reflector.getAllAndOverride<PermissionChecker[]>(PERMISSION_CHECKERS, [
        context.getHandler(),
        context.getClass(),
    ]);
    return crudCheckers ?? defaultCheckers;
};

export const checkPermissions = async ({
    resolver,
    userRepo,
    request,
    checkers,
    moduleRef,
}: {
    resolver: RbacResolver;
    userRepo: UserRepository;
    checkers: PermissionChecker[];
    moduleRef: ModuleRef;
    request?: any;
}) => {
    // 请求上没带user信息，有问题，返回false
    if (isNil(request.user)) return false;
    // 查询user信息
    const user = await userRepo.findOne({
        where: {
            id: request.user.id,
        },
        relations: ['permissions', 'roles.resources'],
    });
    let permissions = user.permissions as ResourceEntity[];
    // 角色的权限
    for (const role of user.roles) {
        permissions = [...permissions, ...role.resources];
    }
    permissions = permissions.filter((permission) => !isNil(permission.rule));
    // 按name去重
    permissions = permissions.reduce((o, n) => {
        if (o.find(({ name }) => name === n.name)) return permissions;
        return [...o, n];
    }, []);
    // 去resolver中创建checkers
    const ability = createMongoAbility(
        permissions.map(({ rule, name }) => {
            const resolve = resolver.permissions.find((p) => p.name === name);
            if (!isNil(resolve) && !isNil(resolve.rule.conditions)) {
                // 一些前台权限需要根据user来判断能否操作，比如删除某篇文章
                return { ...rule, conditions: resolve.rule.conditions(user) };
            }
            return rule;
        }),
    );
    const results = await Promise.all(
        checkers.map(async (checker) => checker(ability, moduleRef, request)),
    );
    return results.every((r) => !!r);
};
