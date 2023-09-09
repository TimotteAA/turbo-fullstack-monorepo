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
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';

import { AppIntercepter } from '@/modules/core/providers';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos/post.dto';
import { PostService } from '../services';

@UseInterceptors(AppIntercepter)
@Controller('posts')
export class PostController {
    constructor(protected service: PostService) {}

    @Post()
    @SerializeOptions({ groups: ['post-detail'] })
    async create(
        @Body(
            new ValidationPipe({
                // 对序列化后的plain对象转换成dto
                transform: true,
                // 过滤掉没有添加装饰器的字段，可以用Allow装饰器避免被抹去
                whitelist: true,
                // 配合上面的
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
                groups: ['create'],
            }),
        )
        data: CreatePostDto,
    ) {
        return this.service.create(data);
    }

    @Patch()
    @SerializeOptions({ groups: ['post-detail'] })
    async update(
        @Body(
            new ValidationPipe({
                // 对序列化后的plain对象转换成dto
                transform: true,
                // 过滤掉没有添加装饰器的字段，可以用Allow装饰器避免被抹去
                whitelist: true,
                // 配合上面的
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
                groups: ['update'],
            }),
        )
        data: UpdatePostDto,
    ) {
        return this.service.update(data);
    }

    @Get(':id')
    @SerializeOptions({ groups: ['post-detail'] })
    async detail(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.detail(id);
    }

    @Get()
    @SerializeOptions({ groups: ['post-list'] })
    async list(
        @Query(
            new ValidationPipe({
                // 对序列化后的plain对象转换成dto
                transform: true,
                // 过滤掉没有添加装饰器的字段，可以用Allow装饰器避免被抹去
                whitelist: true,
                // 配合上面的
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
            }),
        )
        options: QueryPostDto,
    ) {
        return this.service.paginate(options);
    }

    @Delete(':id')
    @SerializeOptions({ groups: ['post-detail'] })
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.delete(id);
    }
}
