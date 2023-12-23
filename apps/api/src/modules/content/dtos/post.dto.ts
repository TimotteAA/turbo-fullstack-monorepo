import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
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
import { IsExists } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';
import { UserEntity } from '@/modules/user/entities';

import { PostOrderType } from '../constants';
import { CategoryEntity, TagEntity } from '../entities';

@DTO_VALIDATION({ type: 'query' })
export class QueryPostDto extends ListQueryDto {
    @ApiPropertyOptional({ description: '文章是否发布' })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({ enum: PostOrderType, description: '文章排序字段' })
    @IsEnum(PostOrderType, {
        message: `$property必须是${Object.values(PostOrderType).join(', ')}中的一个`,
    })
    @IsOptional()
    orderBy?: PostOrderType;

    @ApiPropertyOptional({ description: '查询某一标签下的文章' })
    @IsUUID(undefined, { message: '标签id不是uuid' })
    @IsOptional()
    tag?: string;

    @ApiPropertyOptional({ description: '查询某一分类下的文章' })
    @IsUUID(undefined, { message: '分类id不是uuid' })
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({ description: '查询软删除的文章', enum: SelectTrashMode })
    @IsEnum(SelectTrashMode, {
        message: `$property的值必须是${Object.values(SelectTrashMode).join(', ')}中的一个`,
    })
    @IsOptional()
    trashed?: SelectTrashMode;

    @ApiPropertyOptional({ description: '搜索关键词' })
    @MaxLength(100, {
        always: true,
        message: '搜索关键词长度不能超过100',
    })
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: '查询某一用户的文章' })
    @IsExists({ entity: UserEntity }, { message: '用户不存在' })
    @IsOptional()
    author?: string;
}

@DTO_VALIDATION({ groups: ['create'] })
export class CreatePostDto {
    @ApiProperty({ description: '文章标题' })
    @MaxLength(30, { message: '$property的长度不能超过30' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'] })
    title!: string;

    @ApiProperty({ description: '文章内容' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'] })
    body!: string;

    @ApiPropertyOptional({ description: '文章描述' })
    @MaxLength(30, { message: '$property的长度不能超过30' })
    @IsOptional({ always: true })
    summary?: string;

    @ApiPropertyOptional({ description: '文章关键词', type: [String] })
    @MaxLength(30, { message: '$property的长度不能超过30', each: true })
    @IsOptional({ always: true })
    keywords?: string[];

    @ApiPropertyOptional({ description: '文章发表日期' })
    @Type(() => Date)
    @IsDateString({ strict: true }, { message: '$property必须是时间格式的字符串' })
    @IsOptional({ always: true })
    @ValidateIf((value) => !isNil(value.publishedAt))
    @Transform(({ value }) => (value === 'null' ? null : value))
    publishedAt?: Date;

    @ApiPropertyOptional({ description: '文章自定义排序值' })
    @Transform(({ value }) => toNumber(value))
    @Min(0, {
        message: '$property最小值为0',
    })
    @IsNumber()
    @IsOptional({ always: true })
    customOrder?: number;

    @ApiPropertyOptional({ description: '文章所属分类' })
    @IsExists({ entity: CategoryEntity }, { message: '分类不存在', always: true })
    @IsUUID(undefined, { message: '分类id不是uuid' })
    @IsNotEmpty({ groups: ['create'], message: '分类必须设置' })
    @IsOptional({ groups: ['update'] })
    category: string;

    @ApiPropertyOptional({ description: '文章标签id数组' })
    @IsExists({ entity: TagEntity }, { each: true, message: '标签不存在', always: true })
    @IsUUID(undefined, { each: true, message: '标签id不是uuid' })
    @IsOptional({ always: true })
    tags?: string[];
}

@DTO_VALIDATION({ groups: ['update'] })
export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiProperty({ description: '待更新文章id' })
    @IsUUID(undefined, {
        message: '$property不是uuid',
    })
    @IsNotEmpty({ groups: ['update'] })
    id!: string;
}

@DTO_VALIDATION({ type: 'query' })
export class QueryFrontendPostDto extends OmitType(QueryPostDto, ['trashed', 'isPublished']) {}

// 查看自己发布的文章
@DTO_VALIDATION({ type: 'query' })
export class QueryOwnerPostDto extends QueryPostDto {}
