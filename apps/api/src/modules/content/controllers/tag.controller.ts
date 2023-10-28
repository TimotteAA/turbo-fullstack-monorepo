import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from '@/modules/core/decorators';
import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../content.module';
import { CreateTagDto, QueryCategoryDto, UpdateTagDto } from '../dtos';
import { TagService } from '../services';

@ApiTags('标签操作')
@Depends(ContentModule)
@Crud({
    id: 'tag',
    enabled: ['create', 'update', 'delete', 'detail', 'list'],
    dtos: {
        create: CreateTagDto,
        update: UpdateTagDto,
        query: QueryCategoryDto,
    },
})
@Controller('tags')
export class TagController extends BaseController<TagService> {
    constructor(protected service: TagService) {
        super(service);
    }

    @Get()
    @SerializeOptions({})
    @ResponseMessage('获得数据成功')
    async list(
        @Query()
        options: QueryCategoryDto,
    ) {
        return this.service.paginate(options);
    }

    // @Get(':id')
    // @SerializeOptions({})
    // async detail(
    //     @Param('id', new ParseUUIDPipe())
    //     id: string,
    // ) {
    //     return this.service.detail(id);
    // }

    // @Post()
    // @SerializeOptions({})
    // async create(
    //     @Body()
    //     data: CreateTagDto,
    // ) {
    //     return this.service.create(data);
    // }

    // @Patch()
    // @SerializeOptions({})
    // async update(
    //     @Body()
    //     data: UpdateTagDto,
    // ) {
    //     return this.service.update(data);
    // }

    // @Delete()
    // @SerializeOptions({})
    // async delete(@Body() data: DeleteDto) {
    //     return this.service.delete(data.ids);
    // }
}
