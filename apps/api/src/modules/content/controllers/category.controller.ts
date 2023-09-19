import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    SerializeOptions,
} from '@nestjs/common';

import { DeleteWithTrashDto, RestoreDto } from '@/modules/restful/dtos';

import { CreateCategoryDto, QueryCategoryTreeDto, UpdateCategoryDto } from '../dtos';
import { CategoryService } from '../services';

@Controller('categories')
export class CategoryController {
    constructor(protected service: CategoryService) {}

    @Get('tree')
    @SerializeOptions({ groups: ['category-tree'] })
    async tree(@Query() options: QueryCategoryTreeDto) {
        return this.service.findTrees(options);
    }

    @Delete()
    @SerializeOptions({ groups: ['category-list'] })
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trashed } = data;
        return this.service.delete(ids, trashed);
    }

    @Patch('restore')
    @SerializeOptions({ groups: ['category-list'] })
    async restore(
        @Body()
        data: RestoreDto,
    ) {
        const { ids } = data;
        return this.service.restore(ids);
    }

    @Get(':id')
    @SerializeOptions({ groups: ['category-detail'] })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    @Post()
    @SerializeOptions({ groups: ['category-detail'] })
    async create(
        @Body()
        data: CreateCategoryDto,
    ) {
        return this.service.create(data);
    }

    @Patch()
    @SerializeOptions({ groups: ['category-detail'] })
    async update(
        @Body()
        data: UpdateCategoryDto,
    ) {
        return this.service.update(data);
    }
}
