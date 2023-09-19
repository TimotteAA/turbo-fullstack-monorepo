import { Body, Controller, Delete, Get, Post, Query, SerializeOptions } from '@nestjs/common';

import { DeleteDto } from '@/modules/restful/dtos/delete.dto';

import { CreateCommentDto, QueryCommentListDto, QueryCommentTreeDto } from '../dtos';
import { CommentService } from '../services';

@Controller('comments')
export class CommentController {
    constructor(protected service: CommentService) {}

    @Get('tree')
    @SerializeOptions({ groups: ['comment-tree'] })
    async tree(
        @Query()
        query: QueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }

    @Get()
    @SerializeOptions({ groups: ['comment-list'] })
    async list(
        @Query()
        query: QueryCommentListDto,
    ) {
        return this.service.paginate(query);
    }

    @Post()
    @SerializeOptions({ groups: ['comment-detail'] })
    async create(
        @Body()
        data: CreateCommentDto,
    ) {
        return this.service.create(data);
    }

    @Delete()
    @SerializeOptions({ groups: ['comment-detail'] })
    async delete(@Body() data: DeleteDto) {
        return this.service.delete(data.ids);
    }
}
