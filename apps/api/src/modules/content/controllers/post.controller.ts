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
} from '@nestjs/common';
import { PostService } from '../services';
import { PaginateOptions } from '@/modules/database/types';

@Controller('post')
export class PostController {
    constructor(protected service: PostService) {}

    @Post()
    async create(@Body() data: Record<string, any>) {
        return this.service.create(data);
    }

    @Patch()
    async update(
        @Body()
        data: Record<string, any>,
    ) {
        return this.service.update(data);
    }

    @Get(':id')
    async detail(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.delete(id);
    }

    @Get()
    async list(@Query() options: PaginateOptions) {
        return this.service.paginate(options);
    }

    @Delete(':id')
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.delete(id);
    }
}
