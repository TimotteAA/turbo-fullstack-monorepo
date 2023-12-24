import { Body, Controller, Get, SerializeOptions } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { createOptions } from '@/modules/restful/helpers';

import { CreateSystemDto, QuerySystemDto, QuerySystemTreeDto, UpdateSystemDto } from '../dtos';
import { RbacModule } from '../rbac.module';
import { SystemRepository } from '../repositories';
import { SystemService } from '../services';

@ApiTags('rbac部门管理')
@Depends(RbacModule)
@Crud({
    id: 'department',
    enabled: [
        {
            name: 'create',
            options: createOptions(false, { summary: '创建部门' }),
        },
        {
            name: 'update',
            options: createOptions(false, { summary: '更新部门' }),
        },
        {
            name: 'delete',
            options: createOptions(false, { summary: '删除部门' }),
        },
        {
            name: 'list',
            options: createOptions(false, { summary: '分页查询部门' }),
        },
        {
            name: 'detail',
            options: createOptions(false, { summary: '查询部门详情' }),
        },
    ],
    dtos: {
        create: CreateSystemDto,
        update: UpdateSystemDto,
        query: QuerySystemDto,
    },
})
@Controller('departments')
export class SystemController extends BaseController<SystemService, SystemRepository> {
    constructor(protected service: SystemService) {
        super(service);
    }

    @ApiOperation({ description: '查询部门树' })
    @Get('tree')
    @SerializeOptions({ groups: ['system-tree'] })
    async tree(@Body() data: QuerySystemTreeDto) {
        return this.service.tree(data);
    }
}
