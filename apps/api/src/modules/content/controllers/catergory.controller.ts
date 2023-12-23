import { Controller, Get, Param, ParseUUIDPipe, SerializeOptions } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SelectTrashMode } from '@/modules/database/constants';
import { ALLOW_GUEST } from '@/modules/rbac/decorators';
import { Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../content.module';
import { CategoryService } from '../services';

@ApiTags('分类接口')
@Depends(ContentModule)
@Controller('categories')
export class CategoryController {
    constructor(protected categoryService: CategoryService) {}

    @SerializeOptions({ groups: ['category-tree'] })
    @ALLOW_GUEST(true)
    @ApiOperation({ summary: '查询分类树' })
    @Get('tree')
    async tree() {
        return this.categoryService.findTrees({
            trashed: SelectTrashMode.NONE,
        });
    }

    @SerializeOptions({ groups: ['category-list'] })
    @ALLOW_GUEST(true)
    @ApiOperation({ summary: '查询分类列表' })
    @Get()
    async list() {
        return this.categoryService.list({
            trashed: SelectTrashMode.NONE,
        });
    }

    @SerializeOptions({ groups: ['category-detail'] })
    @ALLOW_GUEST(true)
    @ApiOperation({ summary: '查询分类详情' })
    @Get(':id')
    async detail(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoryService.detail(id);
    }
}
