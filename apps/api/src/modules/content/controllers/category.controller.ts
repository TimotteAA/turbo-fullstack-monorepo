import { Body, Controller, Delete, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Depends } from '@/modules/restful/decorators';
import { RegisterCrud } from '@/modules/restful/decorators/register-crud';
import { createOptions } from '@/modules/restful/helpers';

import { ContentModule } from '../content.module';
import {
    CreateCategoryDto,
    QueryCategoryDto,
    QueryCategoryTreeDto,
    UpdateCategoryDto,
} from '../dtos';
import { CategoryService } from '../services';
import { DeleteWithTrashDto } from '@/modules/restful/dtos';

@ApiTags('分类操作')
@Depends(ContentModule)
@RegisterCrud((_configure) => ({
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
}))
// @Crud({
//     id: 'category',
//     enabled: ['create', 'update', 'delete', 'list', 'restore', 'detail'],
//     dtos: {
//         create: CreateCategoryDto,
//         update: UpdateCategoryDto,
//         query: QueryCategoryDto,
//     },
// })
@Controller('categories')
export class CategoryController extends BaseController<CategoryService> {
    constructor(protected service: CategoryService) {
        super(service);
    }

    @ApiOperation({ summary: '查询分类树' })
    @Get('tree')
    @SerializeOptions({ groups: ['category-tree'] })
    async tree(@Query() options: QueryCategoryTreeDto) {
        return this.service.findTrees(options);
    }

    //     @Get()
    //     @SerializeOptions({ groups: ['category-list'] })
    //     async list(@Query() options: QueryCategoryDto) {
    //         return this.service.paginate(options);
    //     }

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

    //     @Patch('restore')
    //     @SerializeOptions({ groups: ['category-list'] })
    //     async restore(
    //         @Body()
    //         data: RestoreDto,
    //     ) {
    //         const { ids } = data;
    //         return this.service.restore(ids);
    //     }

    //     @Get(':id')
    //     @SerializeOptions({ groups: ['category-detail'] })
    //     async detail(
    //         @Param('id', new ParseUUIDPipe())
    //         id: string,
    //     ) {
    //         return this.service.detail(id);
    //     }

    //     @Post()
    //     @SerializeOptions({ groups: ['category-detail'] })
    //     async create(
    //         @Body()
    //         data: CreateCategoryDto,
    //     ) {
    //         return this.service.create(data);
    //     }

    //     @Patch()
    //     @SerializeOptions({ groups: ['category-detail'] })
    //     async update(
    //         @Body()
    //         data: UpdateCategoryDto,
    //     ) {
    //         return this.service.update(data);
    //     }
}
