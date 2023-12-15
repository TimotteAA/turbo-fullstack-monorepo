import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { createOptions } from '@/modules/restful/helpers';

import { RbacModule } from '../rbac.module';
import { ResourceService } from '../services';

import { QueryResourceDto, UpdateResourceDto } from '../dtos/resource.dto';

@ApiTags('rbac资源管理')
@Depends(RbacModule)
@Crud({
    id: 'role',
    enabled: [
        {
            name: 'list',
            options: createOptions(true, { summary: '分页查询资源' }),
        },
        {
            name: 'update',
            options: createOptions(true, { summary: '更新单挑资源' }),
        },
    ],
    dtos: {
        update: UpdateResourceDto,
        query: QueryResourceDto,
    },
})
@Depends(RbacModule)
@Controller('resources')
export class ResourceController extends BaseController<ResourceService> {
    constructor(protected readonly service: ResourceService) {
        super(service);
    }

    @ApiOperation({ description: '获取菜单树' })
    @Get('tree')
    async tree() {
        return this.service.findTrees();
    }
}
