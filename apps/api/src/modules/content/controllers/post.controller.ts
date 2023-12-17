import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../content.module';

@Depends(ContentModule)
@ApiBearerAuth()
@ApiTags('文章接口')
@Controller('posts')
export class PostController {
    @Get()
    async list() {
        return 'hi';
    }
}
