import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
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

import { toBoolean } from '@/modules/core/utils';
import { PaginateOptions } from '@/modules/database/types';
import { PostOrderType } from '../constants';

export class QueryPostDto implements PaginateOptions {
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
}

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
}

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsUUID(undefined, {
        message: '$property不是uuid',
    })
    @IsNotEmpty({ groups: ['update'] })
    id!: string;
}
