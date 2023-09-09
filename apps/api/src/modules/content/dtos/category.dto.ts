import { PartialType } from '@nestjs/swagger';
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

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { IsExists, IsTreeUnique, IsTreeUniqueExist } from '@/modules/database/constraints';
import { PaginateOptions } from '@/modules/database/types';

import { CategoryEntity } from '../entities';

@DTO_VALIDATION({ groups: ['query'] })
export class QueryCategoryDto implements PaginateOptions {
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
export class CreateCategoryDto {
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

    @Transform(({ value }) => toNumber(value))
    @Min(0, {
        message: '$property最小值为0',
        always: true,
    })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;

    @IsExists({ entity: CategoryEntity }, { message: '父分类不存在' })
    @IsUUID(undefined, { message: '父分类id格式错误', always: true })
    @ValidateIf((value) => value.parent !== null && value.parent !== undefined)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value !== 'null' ? value : null))
    parent?: string;
}
@DTO_VALIDATION({ groups: ['update'] })
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsUUID(undefined, { groups: ['update'], message: '分类id格式错误' })
    @IsNotEmpty({ groups: ['update'], message: '分类id不能为空' })
    id!: string;
}
