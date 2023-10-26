import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { toNumber } from 'lodash';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { SelectTrashMode } from '@/modules/database/constants';
import { PaginateOptions } from '@/modules/database/types';

@DTO_VALIDATION({ type: 'query' })
export class ListQueryDto implements PaginateOptions {
    @ApiPropertyOptional({
        description: '页码',
        minimum: 1,
        default: 1,
    })
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page: number = 1;

    @ApiPropertyOptional({
        default: 10,
        type: Number,
        description: '当前页显示数据',
    })
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据必须大于5' })
    @IsNumber()
    @IsOptional()
    limit: number = 10;
}

@DTO_VALIDATION({ type: 'query' })
export class ListQueryDtoWithTrashed implements PaginateOptions {
    @ApiPropertyOptional({
        description:
            "是否查询软删除分类，'all'表示查询所有分类，'only'为仅查询软删除分类，'none'为仅查询非软删除分类",
        enum: SelectTrashMode,
    })
    @IsEnum(SelectTrashMode)
    @IsOptional()
    trashed?: SelectTrashMode;

    @ApiPropertyOptional({
        description: '页码',
        minimum: 1,
        default: 1,
    })
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page: number = 1;

    @ApiPropertyOptional({
        default: 10,
        type: Number,
        description: '当前页显示数据',
    })
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据必须大于5' })
    @IsNumber()
    @IsOptional()
    limit: number = 10;
}
