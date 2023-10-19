import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';

import { BaseController } from '@/modules/restful/controller';
import { Depends } from '@/modules/restful/decorators';
import { RegisterCrud } from '@/modules/restful/decorators/register-crud';

import { ContentModule } from '../content.module';
import { CreateCommentDto, QueryCommentListDto, QueryCommentTreeDto } from '../dtos';
import { CommentService } from '../services';

@Depends(ContentModule)
@RegisterCrud((_configure) => ({
    id: 'comment',
    enabled: ['create', 'list', 'detail', 'delete'],
    dtos: {
        create: CreateCommentDto,
        query: QueryCommentListDto,
    },
}))
// @Crud({
//     id: 'comment',
//     enabled: ['create', 'list', 'detail', 'delete'],
//     dtos: {
//         create: CreateCommentDto,
//         query: QueryCommentListDto,
//     },
// })
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
