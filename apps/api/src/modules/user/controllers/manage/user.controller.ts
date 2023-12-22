import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from '@/modules/core/decorators';
import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { DeleteWithTrashDto } from '@/modules/restful/dtos';
import { createOptions } from '@/modules/restful/helpers';

import { BlockUserDto, CreateUserDto, QueryUserDto, UdpateUserDto } from '../../dtos';
import { UserEntity } from '../../entities';
import { AuthService, UserService } from '../../services';
import { UserModule } from '../../user.module';

@ApiTags('用户操作')
@Depends(UserModule)
@Crud({
    id: 'user',
    enabled: [
        {
            name: 'create',
            options: createOptions(false, { summary: '创建用户' }, [
                async (ab) => ab.can('create', UserEntity),
            ]),
        },
        {
            name: 'update',
            options: createOptions(false, { summary: '更新用户' }, [
                async (ab) => ab.can('update', UserEntity),
            ]),
        },
        {
            name: 'delete',
            options: createOptions(false, { summary: '删除用户' }, [
                async (ab) => ab.can('delete', UserEntity),
            ]),
        },
        {
            name: 'list',
            options: createOptions(false, { summary: '分页查询用户' }, [
                async (ab) => ab.can('list', UserEntity),
            ]),
        },
        {
            name: 'detail',
            options: createOptions(false, { summary: '查询用户详情' }, [
                async (ab) => ab.can('detail', UserEntity),
            ]),
        },
        {
            name: 'restore',
            options: createOptions(false, { summary: '恢复软删除用户' }, [
                async (ab) => ab.can('restore', UserEntity),
            ]),
        },
    ],
    dtos: {
        create: CreateUserDto,
        update: UdpateUserDto,
        query: QueryUserDto,
    },
})
@Controller('manage')
export class UserController extends BaseController<UserService> {
    constructor(
        protected service: UserService,
        protected authService: AuthService,
    ) {
        super(service);
    }

    @ResponseMessage('禁止用户成功')
    @Post('block')
    async blockUser(@Body() data: BlockUserDto) {
        return 'test';
    }

    @Delete()
    async delete(@Body() { ids, trashed }: DeleteWithTrashDto): Promise<any> {
        return this.service.delete(ids, trashed);
    }
}
