import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';
import { RegisterCrud } from '@/modules/restful/decorators/register-crud';
import { createOptions } from '@/modules/restful/helpers';

import { CreateUserDto, QueryUserDto, UdpateUserDto } from '../dtos';
import { UserService } from '../services';
import { UserModule } from '../user.module';
import { BaseController } from '@/modules/restful/controller';

@ApiTags('用户操作')
@Depends(UserModule)
@RegisterCrud((_configure) => ({
    id: 'category',
    enabled: [
        {
            name: 'create',
            options: createOptions(true, { summary: '创建用户' }),
        },
        {
            name: 'update',
            options: createOptions(true, { summary: '更新用户' }),
        },
        {
            name: 'delete',
            options: createOptions(true, { summary: '删除用户' }),
        },
        {
            name: 'list',
            options: createOptions(true, { summary: '分页查询用户' }),
        },
        {
            name: 'restore',
            options: createOptions(true, { summary: '恢复软删除用户' }),
        },
        {
            name: 'detail',
            options: createOptions(true, { summary: '查询用户详情' }),
        },
    ],
    dtos: {
        create: CreateUserDto,
        update: UdpateUserDto,
        query: QueryUserDto,
    },
}))
@Controller('manage')
export class UserController extends BaseController<UserService> {
    constructor(protected service: UserService) {
        super(service);
    }
}
