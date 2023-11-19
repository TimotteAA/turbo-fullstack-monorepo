import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { createOptions } from '@/modules/restful/helpers';

import { RbacModule } from '../rbac.module';
import { ResourceService } from '../services';

import { CreateResourceDto, QueryResoureceDto, UpdateResourceDto } from '../dtos/resource.dto';

@ApiTags('rbac资源管理')
@Depends(RbacModule)
@Crud({
    id: 'role',
    enabled: [
        {
            name: 'create',
            options: createOptions(true, { summary: '创建资源' }),
        },
        {
            name: 'update',
            options: createOptions(true, { summary: '更新资源' }),
        },
        {
            name: 'delete',
            options: createOptions(true, { summary: '删除资源' }),
        },
        {
            name: 'list',
            options: createOptions(true, { summary: '分页查询资源' }),
        },
        {
            name: 'detail',
            options: createOptions(true, { summary: '查询资源详情' }),
        },
    ],
    dtos: {
        create: CreateResourceDto,
        update: UpdateResourceDto,
        query: QueryResoureceDto,
    },
})
@Depends(RbacModule)
@Controller('resources')
export class ResourceController extends BaseController<ResourceService> {
    constructor(protected readonly service: ResourceService) {
        super(service);
    }

    @Post('tree')
    async tree() {
        return this.service.findTrees();
    }
}
