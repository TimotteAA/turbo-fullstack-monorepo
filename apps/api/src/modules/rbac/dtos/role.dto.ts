import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { IsExists, IsUnique, IsUniqueExist } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';

import { Status } from '../constants';
import { ResourceEntity, RoleEntity } from '../entities';

@DTO_VALIDATION({ type: 'query' })
export class QueryRoleDto extends ListQueryDto {
    @MaxLength(30, { message: '搜索内容最长为30个字符' })
    @IsOptional()
    search?: string;
}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateRoleDto {
    @ApiProperty({ description: '角色名称', maxLength: 30 })
    @IsUniqueExist({ entity: RoleEntity }, { message: '角色名称重复222', groups: ['update'] })
    @IsUnique({ entity: RoleEntity }, { message: '角色名称重复', groups: ['create'] })
    @MaxLength(30, { message: '角色名称的最大长度为30', always: true })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '角色名称不能为空' })
    name: string;

    @ApiPropertyOptional({ description: '角色描述', maxLength: 30 })
    @MaxLength(200, { message: '角色描述的长度不能超过200', always: true })
    @IsOptional({ always: true })
    description?: string;

    @ApiPropertyOptional({ description: '角色对应的权限id数组', type: [String] })
    @IsExists({ entity: ResourceEntity }, { message: '资源不存在', always: true, each: true })
    @IsUUID(undefined, { message: '部分id格式不对', each: true, always: true })
    @IsArray({ always: true })
    @IsOptional({ always: true })
    resources?: string[];

    @ApiPropertyOptional({ description: '角色是否启用', enum: Status })
    @IsEnum(Status, {
        always: true,
        message: `角色状态只能是以下的值${Object.values(Status).join(', ')}`,
    })
    @IsOptional({ always: true })
    status?: Status;
}

@DTO_VALIDATION({ groups: ['update'] })
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @ApiProperty({ description: '角色id' })
    @IsUUID(undefined, { groups: ['update'], message: '角色id格式错误' })
    @IsNotEmpty({ groups: ['update'], message: '角色id不能为空' })
    id!: string;
}
