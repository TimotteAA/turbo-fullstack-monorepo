import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    SerializeOptions,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { In, IsNull, Not } from 'typeorm';

import { SelectTrashMode } from '@/modules/database/constants';
import { PermissionAction } from '@/modules/rbac/constants';
import { ALLOW_GUEST, PERMISSIONS } from '@/modules/rbac/decorators';
import { PermissionChecker } from '@/modules/rbac/types';
import { checkOwnerPermission } from '@/modules/rbac/utils';
import { Depends } from '@/modules/restful/decorators';
import { DeleteWithTrashDto, RestoreDto } from '@/modules/restful/dtos';
import { reqUser } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';

import { PostOrderType } from '../constants';
import { ContentModule } from '../content.module';
import { CreatePostDto, QueryFrontendPostDto, QueryOwnerPostDto, UpdatePostDto } from '../dtos';
import { PostEntity } from '../entities';
import { PostRepository } from '../repositories';

import { PostService } from '../services/post.service';

const permission: Record<'create' | 'owner', PermissionChecker> = {
    create: async (ab) => ab.can(PermissionAction.CREATE, PostEntity.name),
    owner: async (ab, ref, request) =>
        checkOwnerPermission(ab, {
            request,
            getData: async (ids) =>
                ref.get(PostRepository, { strict: false }).find({
                    where: {
                        id: In(ids),
                    },
                    relations: ['author'],
                }),
        }),
};

@Depends(ContentModule)
@ApiTags('文章接口')
@Controller('posts')
export class PostController {
    constructor(protected readonly postService: PostService) {}

    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-detail'] })
    @ApiOperation({ summary: '创建一篇文章' })
    @PERMISSIONS(permission.create)
    @Post()
    async create(@reqUser() user: ClassToPlain<UserEntity>, @Body() data: CreatePostDto) {
        return this.postService.create(data, user.id);
    }

    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-detail'] })
    @ApiOperation({ summary: '更新文章' })
    @PERMISSIONS(permission.owner)
    @Patch()
    async update(@Body() data: UpdatePostDto) {
        return this.postService.update(data);
    }

    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-detail'] })
    @ApiOperation({ summary: '删除文章' })
    @PERMISSIONS(permission.owner)
    @Delete()
    async delete(@Body() data: DeleteWithTrashDto) {
        return this.postService.delete(data.ids, data.trashed);
    }

    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-detail'] })
    @ApiOperation({ summary: '恢复文章' })
    @PERMISSIONS(permission.owner)
    @Post('restore')
    async restore(@Body() data: RestoreDto) {
        return this.postService.restore(data.ids);
    }

    @ALLOW_GUEST(true)
    @ApiOperation({ summary: '分页查询文章' })
    @SerializeOptions({ groups: ['post-list'] })
    @ALLOW_GUEST(true)
    @Get()
    async list(@Query() data: QueryFrontendPostDto) {
        const res = await this.postService.list({
            ...data,
            isPublished: true,
            trashed: SelectTrashMode.NONE,
            orderBy: PostOrderType.COMMENTCOUNT,
        });
        return res;
    }

    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-list'] })
    @ApiOperation({ summary: '查看自己发表的所有文章' })
    @Get('owner')
    async listOnwer(@reqUser() user: ClassToPlain<UserEntity>, @Query() data: QueryOwnerPostDto) {
        return this.postService.list({ ...data, author: user.id });
    }

    @ALLOW_GUEST(true)
    @SerializeOptions({ groups: ['post-detail'] })
    @ApiOperation({ summary: '查看文章详情' })
    @Get(':id')
    async detail(@Param('id', ParseUUIDPipe) id: string) {
        return this.postService.detail(id, async (qb) =>
            qb.andWhere({ publishedAt: Not(IsNull()), deletedAt: IsNull() }),
        );
    }

    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-detail'] })
    @ApiOperation({ summary: '查看自己发表文章详情' })
    @Get('owner/:id')
    async ownerDetail(
        @reqUser() user: ClassToPlain<UserEntity>,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.postService.detail(id, async (qb) =>
            qb.andWhere(`post.author.id = :id`, { id: user.id }),
        );
    }
}
