import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';

import { BaseService } from '@/modules/database/base';

import { CreateUserDto, UdpateUserDto } from '../dtos';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositorys';

@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> {
    constructor(private readonly repo: UserRepository) {
        super(repo);
    }

    async create(data: CreateUserDto) {
        const res = await this.repo.save(data);
        return this.detail(res.id);
    }

    async update(data: UdpateUserDto) {
        const res = await this.repo.save(omit(data, ['id']));
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
}
