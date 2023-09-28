import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, MaxLength, Min } from 'class-validator';
import { toNumber } from 'lodash';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { PaginateOptions } from '@/modules/database/types';

@DTO_VALIDATION({ type: 'query' })
export class QueryTagDto implements PaginateOptions {
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '$property最小值为1' })
    @IsNumber()
    @IsOptional()
    page: number;

    @Transform(({ value }) => toNumber(value))
    @Min(10, { message: '$property最小值为1' })
    @IsNumber()
    @IsOptional()
    limit: number;
}
@DTO_VALIDATION({ groups: ['create'] })
export class CreateTagDto {
    @MaxLength(30, {
        message: '$property长度不能超过30',
        always: true,
    })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '标签名称不能为空' })
    name!: string;

    @MaxLength(50, {
        message: '标签描述$property长度不能超过50',
        always: true,
    })
    @IsOptional({ always: true })
    description?: string;

    @Transform(({ value }) => toNumber(value))
    @Min(0, {
        message: '$property最小值为0',
        always: true,
    })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;
}
@DTO_VALIDATION({ groups: ['update'] })
export class UpdateTagDto extends PartialType(CreateTagDto) {
    @IsUUID(undefined, {
        message: '标签id不是uuid格式',
    })
    @IsNotEmpty({ groups: ['update'], message: '标签id必须指定' })
    id!: string;
}
