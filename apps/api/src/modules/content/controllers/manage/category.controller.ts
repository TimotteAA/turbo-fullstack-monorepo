import { Body, Controller, Delete, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ALLOW_GUEST } from '@/modules/rbac/decorators/guest.decorator';
import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { DeleteWithTrashDto } from '@/modules/restful/dtos';
import { createOptions } from '@/modules/restful/helpers';

import { ContentModule } from '../../content.module';
import {
    CreateCategoryDto,
    QueryCategoryDto,
    QueryCategoryTreeDto,
    UpdateCategoryDto,
} from '../../dtos';
import { CategoryService } from '../../services';

@ApiTags('分类操作')
@Depends(ContentModule)
@Crud({
    id: 'category',
    enabled: [
        {
            name: 'create',
            options: createOptions(true, { summary: '创建分类' }),
        },
        {
            name: 'update',
            options: createOptions(true, { summary: '更新分类' }),
        },
        {
            name: 'delete',
            options: createOptions(true, { summary: '删除分类' }),
        },
        {
            name: 'list',
            options: createOptions(true, { summary: '分页查询分类' }),
        },
        {
            name: 'restore',
            options: createOptions(true, { summary: '恢复软删除分类' }),
        },
        {
            name: 'detail',
            options: createOptions(true, { summary: '查询分类详情' }),
        },
    ],
    dtos: {
        create: CreateCategoryDto,
        update: UpdateCategoryDto,
        query: QueryCategoryDto,
    },
})
@Controller('categories')
export class CategoryController extends BaseController<CategoryService> {
    constructor(protected service: CategoryService) {
        super(service);
    }

    @ApiOperation({ summary: '查询分类树' })
    @Get('tree')
    @SerializeOptions({ groups: ['category-tree'] })
    @ALLOW_GUEST(true)
    async tree(@Query() options: QueryCategoryTreeDto) {
        return this.service.findTrees(options);
    }

    @ApiOperation({ summary: '删除分类，支持软删除' })
    @Delete()
    @SerializeOptions({ groups: ['category-list'] })
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trashed } = data;
        return this.service.delete(ids, trashed);
    }
}
