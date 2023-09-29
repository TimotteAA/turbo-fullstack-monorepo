import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';

import { BaseController } from '@/modules/restful/controller';
import { Crud } from '@/modules/restful/decorators';

import {
    CreateCategoryDto,
    QueryCategoryDto,
    QueryCategoryTreeDto,
    UpdateCategoryDto,
} from '../dtos';
import { CategoryService } from '../services';

@Crud({
    id: 'category',
    enabled: ['create', 'update', 'delete', 'list', 'restore', 'detail'],
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

    //     @Delete()
    //     @SerializeOptions({ groups: ['category-list'] })
    //     async delete(
    //         @Body()
    //         data: DeleteWithTrashDto,
    //     ) {
    //         const { ids, trashed } = data;
    //         return this.service.delete(ids, trashed);
    //     }

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
