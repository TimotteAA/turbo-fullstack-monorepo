import { Body, Get, Post, Delete, Patch, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { ServiceListQueryOption } from '@/modules/database/types';

import { DeleteDto, ListQueryDto, QueryDetailDto, RestoreDto } from './dtos';

export abstract class BaseController<
    S,
    P extends ServiceListQueryOption<any> = ServiceListQueryOption<any>,
> {
    protected service: S;

    constructor(service: S) {
        this.service = service;
    }

    @Get()
    async list(@Query() params: P & ListQueryDto) {
        return (this.service as any).paginate(params);
    }

    @Get(':id')
    async detail(@Param('id', ParseUUIDPipe) id: string, @Query() options: QueryDetailDto) {
        return (this.service as any).detail(id, options.trashed);
    }

    @Post()
    async create(@Body() data: any, ...args: any[]) {
        return (this.service as any).create(data, ...args);
    }

    @Patch()
    async update(@Body() data: any, ..._args: any[]) {
        return (this.service as any).update(data);
    }

    @Delete()
    async delete(@Body() options: DeleteDto) {
        return (this.service as any).delete(options.ids);
    }

    @Patch('restore')
    async restore(
        @Body()
        { ids }: RestoreDto,
        ..._args: any[]
    ) {
        return (this.service as any).restore(ids);
    }
}
