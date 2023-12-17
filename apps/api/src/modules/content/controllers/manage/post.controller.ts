import { Body, Controller, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { DeleteWithTrashDto } from '@/modules/restful/dtos';
import { createOptions } from '@/modules/restful/helpers';

import { ContentModule } from '../../content.module';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../../dtos';
import { PostService } from '../../services/post.service';

@ApiTags('文章操作')
@Depends(ContentModule)
@Crud({
    id: 'post',
    enabled: [
        {
            name: 'create',
            options: createOptions(true, { summary: '创建文章' }),
        },
        {
            name: 'update',
            options: createOptions(true, { summary: '更新文章' }),
        },
        {
            name: 'delete',
            options: createOptions(true, { summary: '删除文章' }),
        },
        {
            name: 'list',
            options: createOptions(true, { summary: '分页查询文章' }),
        },
        {
            name: 'restore',
            options: createOptions(true, { summary: '恢复软删除文章' }),
        },
        {
            name: 'detail',
            options: createOptions(true, { summary: '查询文章详情' }),
        },
    ],
    dtos: {
        create: CreatePostDto,
        update: UpdatePostDto,
        query: QueryPostDto,
    },
})
@Controller('posts')
export class PostController extends BaseController<PostService> {
    constructor(protected service: PostService) {
        super(service);
    }

    // @Get()
    // @SerializeOptions({ groups: ['post-list'] })
    // async list(
    //     @Query()
    //     options: QueryPostDto,
    // ) {
    //     return this.service.list(options);
    // }

    @Delete()
    async delete(@Body() data: DeleteWithTrashDto) {
        return this.service.delete(data.ids, data.trashed);
    }
}
