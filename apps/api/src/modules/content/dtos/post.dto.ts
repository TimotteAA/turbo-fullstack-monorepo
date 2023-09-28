import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { isNil, toNumber } from 'lodash';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { toBoolean } from '@/modules/core/utils';
import { SelectTrashMode } from '@/modules/database/constants';
import { PaginateOptions } from '@/modules/database/types';

import { PostOrderType } from '../constants';

@DTO_VALIDATION({ type: 'query' })
export class QueryPostDto implements PaginateOptions {
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '$property最小值为1' })
    @IsNumber()
    @IsOptional()
    page: number;

    @Transform(({ value }) => toNumber(value))
    @Min(5, { message: '$property最小值为5' })
    @IsNumber()
    @IsOptional()
    limit: number;

    /**
     * 是否发布
     */
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @IsEnum(PostOrderType, {
        message: `$property必须是${Object.values(PostOrderType).join(', ')}中的一个`,
    })
    @IsOptional()
    orderBy?: PostOrderType;

    @IsUUID(undefined, { message: '标签id不是uuid' })
    @IsOptional()
    tag?: string;

    @IsUUID(undefined, { message: '分类id不是uuid' })
    @IsOptional()
    category?: string;

    @IsEnum(SelectTrashMode, {
        message: `$property的值必须是${Object.values(SelectTrashMode).join(', ')}中的一个`,
    })
    @IsOptional()
    trashed?: SelectTrashMode;
}
@DTO_VALIDATION({ groups: ['create'] })
export class CreatePostDto {
    @MaxLength(30, { message: '$property的长度不能超过30' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'] })
    title!: string;

    @MaxLength(1000, { message: '$property的长度不能超过1000' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'] })
    body!: string;

    @MaxLength(30, { message: '$property的长度不能超过30' })
    @IsOptional({ always: true })
    summary?: string;

    @MaxLength(30, { message: '$property的长度不能超过30', each: true })
    @IsOptional({ always: true })
    keywords?: string[];

    @Type(() => Date)
    @IsDateString({ strict: true }, { message: '$property必须是时间格式的字符串' })
    @IsOptional({ always: true })
    @ValidateIf((value) => !isNil(value.publishedAt))
    @Transform(({ value }) => (value === 'null' ? null : value))
    publishedAt?: Date;

    @Transform(({ value }) => toNumber(value))
    @Min(0, {
        message: '$property最小值为0',
    })
    @IsNumber()
    @IsOptional({ always: true })
    customOrder?: number;

    @IsUUID(undefined, { message: '分类id不是uuid' })
    @IsNotEmpty({ groups: ['create'], message: '分类必须设置' })
    @IsOptional({ groups: ['update'] })
    category: string;

    @IsUUID(undefined, { each: true, message: '标签id不是uuid' })
    @IsOptional({ always: true })
    tags?: string[];
}
@DTO_VALIDATION({ groups: ['update'] })
export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsUUID(undefined, {
        message: '$property不是uuid',
    })
    @IsNotEmpty({ groups: ['update'] })
    id!: string;
}
