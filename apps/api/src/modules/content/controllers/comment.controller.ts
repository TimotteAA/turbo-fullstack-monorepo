import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';

import { BaseController } from '@/modules/restful/controller';
import { Crud } from '@/modules/restful/decorators';

import { CreateCommentDto, QueryCommentListDto, QueryCommentTreeDto } from '../dtos';
import { CommentService } from '../services';

@Crud({
    id: 'comment',
    enabled: ['create', 'list', 'detail', 'delete'],
    dtos: {
        create: CreateCommentDto,
        query: QueryCommentListDto,
    },
})
@Controller('comments')
export class CommentController extends BaseController<CommentService> {
    constructor(protected service: CommentService) {
        super(service);
    }

    @Get('tree')
    @SerializeOptions({ groups: ['comment-tree'] })
    async tree(
        @Query()
        query: QueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }
}
