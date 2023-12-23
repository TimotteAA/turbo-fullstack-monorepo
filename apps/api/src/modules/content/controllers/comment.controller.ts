import { Body, Controller, Delete, Get, Post, Query, SerializeOptions } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { In } from 'typeorm';

import { PermissionAction } from '@/modules/rbac/constants';
import { ALLOW_GUEST, PERMISSIONS } from '@/modules/rbac/decorators';
import { PermissionChecker } from '@/modules/rbac/types';
import { checkOwnerPermission } from '@/modules/rbac/utils';
import { Depends } from '@/modules/restful/decorators';
import { DeleteDto } from '@/modules/restful/dtos';

import { ContentModule } from '../content.module';
import { CreateCommentDto, QueryCommentListDto } from '../dtos';
import { CommentEntity } from '../entities';
import { CommentRepository } from '../repositories';
import { CommentService } from '../services';

const permission: PermissionChecker = async (ab) =>
    ab.can(PermissionAction.CREATE, CommentEntity.name);

const ownerPermission: PermissionChecker = async (ab, ref, request) =>
    checkOwnerPermission(ab, {
        request,
        getData: async (ids) =>
            ref.get(CommentRepository, { strict: false }).find({
                where: {
                    id: In(ids),
                },
            }),
    });

@ApiTags('评论接口')
@Depends(ContentModule)
@Controller('comments')
export class CommentController {
    constructor(protected readonly service: CommentService) {}

    @ApiOperation({ summary: '分页查询评论' })
    @ALLOW_GUEST(true)
    @Get()
    @SerializeOptions({ groups: ['comment-list'] })
    async list(
        @Query()
        data: QueryCommentListDto,
    ) {
        return this.service.list(data);
    }

    @SerializeOptions({ groups: ['comment-detail'] })
    @ApiOperation({ summary: '发表评论' })
    @ApiBearerAuth()
    @PERMISSIONS(permission)
    @Post()
    async create(@Body() data: CreateCommentDto) {
        return this.service.create(data);
    }

    @SerializeOptions({ groups: ['comment-detail'] })
    @ApiOperation({ summary: '删除评论' })
    @PERMISSIONS(ownerPermission)
    @Delete()
    async delete(@Body() data: DeleteDto) {
        return this.service.delete(data.ids);
    }
}
