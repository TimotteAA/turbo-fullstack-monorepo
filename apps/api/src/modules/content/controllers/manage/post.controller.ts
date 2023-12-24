import { Body, Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { PERMISSIONS } from '@/modules/rbac/decorators';
import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { DeleteWithTrashDto } from '@/modules/restful/dtos';
import { createOptions } from '@/modules/restful/helpers';

import { ContentModule } from '../../content.module';
import { QueryPostDto } from '../../dtos';
import { PostEntity } from '../../entities';
import { PostService } from '../../services/post.service';

@ApiTags('文章操作')
@Depends(ContentModule)
@Crud({
    id: 'post',
    enabled: [
        {
            name: 'delete',
            options: createOptions(true, { summary: '删除文章' }),
        },
        {
            name: 'restore',
            options: createOptions(true, { summary: '恢复软删除文章' }),
        },
        {
            name: 'detail',
            options: createOptions(true, { summary: '查询文章详情' }),
        },
        {
            name: 'list',
            options: createOptions(true, { summary: '分页文章详情' }),
        },
    ],
    dtos: {
        query: QueryPostDto,
    },
})
@Controller('posts')
export class PostController extends BaseController<PostService> {
    constructor(protected service: PostService) {
        super(service);
    }

    @ApiOperation({ summary: '删除文章，支持软删除' })
    @Delete()
    async delete(@Body() data: DeleteWithTrashDto) {
        return this.service.delete(data.ids, data.trashed);
    }

    @ApiOperation({ summary: '分页查询文章' })
    @PERMISSIONS(async (ab) => ab.can(PermissionAction.LIST, PostEntity.name))
    @Get()
    async list(@Query() options: QueryPostDto) {
        const res = await this.service.list(options);
        return res;
    }
}
