import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID, MaxLength, ValidateIf } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { IsExists, IsTreeUnique, IsTreeUniqueExist } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';

import { SystemEntity } from '../entities';

@DTO_VALIDATION({ type: 'query' })
export class QuerySystemDto extends ListQueryDto {
    @ApiPropertyOptional({ description: '搜索关键词' })
    @MaxLength(30, { message: '搜索内容最长为30个字符' })
    @IsOptional()
    search?: string;
}

export class QuerySystemTreeDto {
    @ApiPropertyOptional({ description: '查询某个部门的子部门' })
    @IsExists({ entity: SystemEntity }, { message: '部门不存在' })
    @IsUUID(undefined, { message: '查询部门的id格式错误' })
    @IsOptional()
    system?: string;
}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateSystemDto {
    @ApiProperty({ description: '部门名称' })
    @IsTreeUniqueExist(
        { entity: SystemEntity },
        { groups: ['update'], message: '同级部门中部门名称重复' },
    )
    @IsTreeUnique(
        { entity: SystemEntity },
        {
            groups: ['create'],
            message: '同级部门中部门名称重复111',
        },
    )
    @MaxLength(30, { message: '部门名称长度不能超过30' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ message: '部门名称不能为空', groups: ['create'] })
    name!: string;

    @ApiPropertyOptional({ description: '部门描述' })
    @MaxLength(200, { message: '部门描述不能超过200' })
    @IsOptional({ always: true })
    description?: string;

    @ApiPropertyOptional({ description: '上级部门id' })
    @IsExists({ entity: SystemEntity }, { message: '上级部门不存在', always: true })
    @IsUUID(undefined, { message: '上级部门的id格式错误' })
    @ValidateIf((value) => value.parent !== null && value.parent !== undefined)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value !== 'null' ? value : null))
    parent?: string;
}

@DTO_VALIDATION({ groups: ['update'] })
export class UpdateSystemDto extends PartialType(CreateSystemDto) {
    @ApiProperty({ description: '待更新部门id' })
    @IsUUID(undefined, { groups: ['update'], message: '部门id格式错误' })
    @IsNotEmpty({ groups: ['update'], message: '部门id不能为空' })
    id!: string;
}
