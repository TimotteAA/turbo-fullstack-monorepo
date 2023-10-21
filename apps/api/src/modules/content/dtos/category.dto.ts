import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { toNumber } from 'lodash';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { SelectTrashMode } from '@/modules/database/constants';
import { IsExists, IsTreeUnique, IsTreeUniqueExist } from '@/modules/database/constraints';
import { PaginateOptions } from '@/modules/database/types';

import { CategoryEntity } from '../entities';

/**
 * 树形分类查询验证
 */
@DTO_VALIDATION({ type: 'query' })
export class QueryCategoryTreeDto {
    @ApiPropertyOptional({
        description:
            "是否查询软删除分类，'all'表示查询所有分类，'only'为仅查询软删除分类，'none'为仅查询非软删除分类",
        enum: SelectTrashMode,
    })
    @IsEnum(SelectTrashMode)
    @IsOptional()
    // @Type(() => Se)
    trashed?: SelectTrashMode;
}

@DTO_VALIDATION({ type: 'query' })
export class QueryCategoryDto extends QueryCategoryTreeDto implements PaginateOptions {
    /**
     * 分页数量
     */
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '$property最小值为1' })
    @IsNumber()
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => toNumber(value))
    @Min(10, { message: '$property最小值为1' })
    @IsNumber()
    @IsOptional()
    limit: number = 10;
}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateCategoryDto {
    @ApiProperty({ description: '分类名称', maxLength: 100 })
    @IsTreeUniqueExist(
        { entity: CategoryEntity },
        { groups: ['update'], message: '同层分类下名称重复' },
    )
    @IsTreeUnique(
        { entity: CategoryEntity },
        {
            groups: ['create'],
            message: '同层分类下名称重复',
        },
    )
    @MaxLength(100, { message: '分类名称最长为100' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '分类名称不能为空' })
    name!: string;

    @ApiPropertyOptional({ description: '分类自定义排序值', default: 0 })
    @Transform(({ value }) => toNumber(value))
    @Min(0, {
        message: '$property最小值为0',
        always: true,
    })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;

    @ApiPropertyOptional({
        description: '父分类id',
        uniqueItems: true,
    })
    @IsExists({ entity: CategoryEntity }, { message: '父分类不存在' })
    @IsUUID(undefined, { message: '父分类id格式错误', always: true })
    @ValidateIf((value) => value.parent !== null && value.parent !== undefined)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value !== 'null' ? value : null))
    parent?: string;
}

@DTO_VALIDATION({ groups: ['update'] })
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiProperty({
        description: '待更新分类的id',
    })
    @IsUUID(undefined, { groups: ['update'], message: '分类id格式错误' })
    @IsNotEmpty({ groups: ['update'], message: '分类id不能为空' })
    id!: string;
}
