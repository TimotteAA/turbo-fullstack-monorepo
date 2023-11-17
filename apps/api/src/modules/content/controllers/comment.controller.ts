import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { createOptions } from '@/modules/restful/helpers';

import { ContentModule } from '../content.module';
import { CreateCommentDto, QueryCommentListDto, QueryCommentTreeDto } from '../dtos';
import { CommentService } from '../services';

@ApiTags('评论操作')
@Depends(ContentModule)
@Crud({
    id: 'comment',
    enabled: [
        {
            name: 'create',
            options: createOptions(true, { summary: '创建评论' }),
        },
        {
            name: 'update',
            options: createOptions(true, { summary: '更新评论' }),
        },
        {
            name: 'delete',
            options: createOptions(true, { summary: '删除评论' }),
        },
        {
            name: 'list',
            options: createOptions(true, { summary: '分页查询评论' }),
        },
        {
            name: 'restore',
            options: createOptions(true, { summary: '恢复软删除评论' }),
        },
        {
            name: 'detail',
            options: createOptions(true, { summary: '查询评论详情' }),
        },
    ],
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

    /**
     * 查询评论树
     * @param query
     * @returns
     */
    @Get('tree')
    @SerializeOptions({ groups: ['comment-tree'] })
    async tree(
        @Query()
        query: QueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }
}
