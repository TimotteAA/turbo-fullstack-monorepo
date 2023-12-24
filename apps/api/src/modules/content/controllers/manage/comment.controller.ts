import { Body, Controller, Delete, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';
import { DeleteDto } from '@/modules/restful/dtos';
import { createOptions } from '@/modules/restful/helpers';

import { ContentModule } from '../../content.module';
import { CreateCommentDto, QueryCommentListDto, QueryCommentTreeDto } from '../../dtos';
import { CommentService } from '../../services';

@ApiTags('评论操作')
@Depends(ContentModule)
@Crud({
    id: 'comment',
    enabled: [
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

    @ApiOperation({ summary: '查询评论树' })
    @Get('tree')
    @SerializeOptions({ groups: ['comment-tree'] })
    async tree(
        @Query()
        query: QueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }

    @ApiOperation({ summary: '删除评论' })
    @SerializeOptions({ groups: ['comment-list'] })
    @Delete()
    async delete(@Body() data: DeleteDto) {
        return this.service.delete(data.ids, false);
    }
}
