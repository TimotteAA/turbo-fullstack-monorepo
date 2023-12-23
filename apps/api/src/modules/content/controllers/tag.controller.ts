import { Controller, Get, Param, ParseUUIDPipe, Query, SerializeOptions } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ALLOW_GUEST } from '@/modules/rbac/decorators';
import { Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../content.module';
import { QueryTagDto } from '../dtos';
import { TagService } from '../services';

@ApiTags('标签接口')
@Depends(ContentModule)
@Controller('tags')
export class TagController {
    constructor(protected readonly tagService: TagService) {}

    @SerializeOptions({ groups: ['tag-list'] })
    @ALLOW_GUEST(true)
    @ApiOperation({ summary: '分页查询标签' })
    @Get()
    async list(@Query() data: QueryTagDto) {
        return this.tagService.list(data);
    }

    @SerializeOptions({ groups: ['tag-detail'] })
    @ALLOW_GUEST(true)
    @ApiOperation({ summary: '查询标签详情' })
    @Get(':id')
    async detail(@Param('id', ParseUUIDPipe) id: string) {
        return this.tagService.detail(id);
    }
}
