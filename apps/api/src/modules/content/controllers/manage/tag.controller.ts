import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/controller';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../../content.module';
import { CreateTagDto, QueryCategoryDto, UpdateTagDto } from '../../dtos';
import { TagService } from '../../services';

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
}
