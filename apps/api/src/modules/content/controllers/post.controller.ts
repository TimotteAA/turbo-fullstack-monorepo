import { Body, Controller, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { DeleteWithTrashDto } from '@/modules/restful/dtos';

import { ContentModule } from '../content.module';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos/post.dto';
import { PostService } from '../services/post.service';

@ApiTags('文章操作')
@Depends(ContentModule)
@Crud({
    id: 'post',
    enabled: ['create', 'update', 'delete', 'restore', 'list'],
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
