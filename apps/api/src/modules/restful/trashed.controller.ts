import { Body, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { DeleteWithTrashDto, ListQueryDtoWithTrashed, RestoreDto } from './dtos';

/**
 * 带软删除验证的控制器
 */
export abstract class BaseControllerWithTrash<S> {
    protected service: S;

    constructor(service: S) {
        this.setService(service);
    }

    private setService(service: S) {
        this.service = service;
    }

    @Get()
    async list(@Query() options: ListQueryDtoWithTrashed, ..._args: any[]) {
        return (this.service as any).paginate(options);
    }

    @Get()
    async detail(
        @Param('id', new ParseUUIDPipe())
        item: string,
        ..._args: any[]
    ) {
        return (this.service as any).detail(item);
    }

    @Post()
    async create(
        @Body()
        data: any,
        ..._args: any[]
    ) {
        return (this.service as any).create(data);
    }

    @Post()
    async update(
        @Body()
        data: any,
        ..._args: any[]
    ) {
        return (this.service as any).update(data);
    }

    @Delete()
    async delete(
        @Body()
        { ids, trashed }: DeleteWithTrashDto,
        ..._args: any[]
    ) {
        return (this.service as any).delete(ids, trashed);
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
