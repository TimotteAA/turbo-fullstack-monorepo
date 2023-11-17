import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { createOptions } from '@/modules/restful/helpers';

import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from '../dtos';
import { RbacModule } from '../rbac.module';
import { RoleRepository } from '../repositories';
import { RoleService } from '../services';

@ApiTags('rbac角色管理')
@Depends(RbacModule)
@Crud({
    id: 'role',
    enabled: [
        {
            name: 'create',
            options: createOptions(true, { summary: '创建角色' }),
        },
        {
            name: 'update',
            options: createOptions(true, { summary: '更新角色' }),
        },
        {
            name: 'delete',
            options: createOptions(true, { summary: '删除角色' }),
        },
        {
            name: 'list',
            options: createOptions(true, { summary: '分页查询角色' }),
        },
        {
            name: 'detail',
            options: createOptions(true, { summary: '查询角色详情' }),
        },
    ],
    dtos: {
        create: CreateRoleDto,
        update: UpdateRoleDto,
        query: QueryRoleDto,
    },
})
@Controller('roles')
export class RoleController extends BaseController<RoleService, RoleRepository> {
    constructor(protected service: RoleService) {
        super(service);
    }
}
