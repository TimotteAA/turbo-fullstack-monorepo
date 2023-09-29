import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';

import { BaseController } from '@/modules/restful/controller';
import { Crud } from '@/modules/restful/decorators';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos/post.dto';
import { PostService } from '../services/post.service';

@Crud({
    id: 'post',
    enabled: ['create', 'update', 'delete', 'detail', 'restore', 'list'],
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

    @Get()
    @SerializeOptions({ groups: ['post-list'] })
    async list(
        @Query()
        options: QueryPostDto,
    ) {
        return this.service.list(options);
    }
}
