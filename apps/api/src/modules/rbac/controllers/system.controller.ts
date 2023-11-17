import { Body, Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { createOptions } from '@/modules/restful/helpers';

import { CreateSystemDto, QuerySystemDto, QuerySystemTreeDto, UpdateSystemDto } from '../dtos';
import { RbacModule } from '../rbac.module';
import { SystemRepository } from '../repositories';
import { SystemService } from '../services';

@ApiTags('rbac系统管理')
@Depends(RbacModule)
@Crud({
    id: 'system',
    enabled: [
        {
            name: 'create',
            options: createOptions(true, { summary: '创建系统' }),
        },
        {
            name: 'update',
            options: createOptions(true, { summary: '更新系统' }),
        },
        {
            name: 'delete',
            options: createOptions(true, { summary: '删除系统' }),
        },
        {
            name: 'list',
            options: createOptions(true, { summary: '分页查询系统' }),
        },
        {
            name: 'detail',
            options: createOptions(true, { summary: '查询系统详情' }),
        },
    ],
    dtos: {
        create: CreateSystemDto,
        update: UpdateSystemDto,
        query: QuerySystemDto,
    },
})
@Controller('systems')
export class SystemController extends BaseController<SystemService, SystemRepository> {
    constructor(protected service: SystemService) {
        super(service);
    }

    @ApiOperation({ description: '查询部门树' })
    @Get('tree')
    async tree(@Body() data: QuerySystemTreeDto) {
        return this.service.tree(data);
    }
}
