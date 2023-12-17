import { Injectable, OnModuleInit } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { EntityNotFoundError, In } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { BaseService } from '@/modules/database/base';
import { RoleRepository } from '@/modules/rbac/repositories';

import { CreateUserDto, UdpateUserDto } from '../dtos';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositorys';
import type { UserModuleConfig } from '../types';

@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> implements OnModuleInit {
    async onModuleInit() {
        if (!(await this.configure.get<boolean>('app.start', false))) return null;
        const adminConf = await this.configure.get<UserModuleConfig['super']>('user.super');
        const admin = await this.findOneByCredential(adminConf.name);
        if (!isNil(admin)) {
            return admin;
        }
        const res = await this.create({
            ...adminConf,
            roles: [],
        });
        return res;
    }

    constructor(
        private readonly repo: UserRepository,
        private readonly roleRepo: RoleRepository,
        private readonly configure: Configure,
    ) {
        super(repo);
    }

    async create(data: CreateUserDto) {
        const res = await this.repo.save({
            ...omit(data, ['id', 'roles']),
            roles: !isNil(data.roles)
                ? await this.roleRepo.find({
                      where: {
                          id: In(data.roles),
                      },
                  })
                : null,
        });
        return this.detail(res.id);
    }

    async update(data: UdpateUserDto) {
        const res = await this.repo.save({
            ...omit(data, ['id', 'roles']),
        });

        if (!isNil(data.roles) && Array.isArray(data.roles) && data.roles.length) {
            const user = await this.repo.findOne({
                where: {
                    id: data.id,
                },
                relations: ['roles'],
            });
            await this.repo
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(user)
                .addAndRemove(data.roles ?? [], user.roles ?? []);
        }

        return this.detail(res.id);
    }

    /**
     * 从name、email、phone中查找
     */
    async findOneByCredential(credential: string) {
        const user = await this.repo.findOne({
            where: [{ name: credential }, { email: credential }, { phone: credential }],
        });
        return user;
    }

    async findOneById(id: string) {
        const user = await this.repo.findOne({
            where: {
                id,
            },
        });
        return user;
    }

    async findOneByConditions(conditions: Record<string, any>) {
        const query = this.repo.buildBaseQB();
        if (Object.keys(conditions).length > 0) {
            const wheres = Object.fromEntries(
                Object.entries(conditions).map(([key, value]) => [key, value]),
            );
            query.andWhere(wheres);
        }
        const user = query.getOne();
        if (isNil(user)) {
            throw new EntityNotFoundError(UserEntity, `${Object.keys(conditions).join(',')}`);
        }
        return user;
    }
}
