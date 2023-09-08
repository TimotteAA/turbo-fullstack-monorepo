import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { toNumber } from 'lodash';

import { PaginateOptions } from '@/modules/database/types';

/**
 * 分页查询评论
 */
export class QueryCommentListDto implements PaginateOptions {
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

    @IsUUID(undefined, { message: '文章id格式错误' })
    @IsOptional()
    post?: string;
}

/**
 * 查询评论树
 */
export class QueryCommentTreeDto extends PickType(QueryCommentListDto, ['post']) {}

export class CreateCommentDto {
    @MaxLength(1000, {
        always: true,
        message: '评论内容长度不能超过1000',
    })
    @IsNotEmpty({ always: true, message: '评论内容不能为空' })
    body!: string;

    @IsUUID(undefined, { message: '文章id格式错误' })
    @IsNotEmpty({ always: true, message: '评论文章必须指定' })
    post: string;

    @IsUUID(undefined, { message: '父分类id格式错误', always: true })
    @ValidateIf((value) => value.parent !== null && value.parent !== undefined)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value !== 'null' ? value : null))
    parent?: string;
}
