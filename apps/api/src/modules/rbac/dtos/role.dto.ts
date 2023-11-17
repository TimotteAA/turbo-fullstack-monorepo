import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { IsExists } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';

import { Status } from '../constants';
import { SystemEntity } from '../entities';

@DTO_VALIDATION({ type: 'query' })
export class QueryRoleDto extends ListQueryDto {
    @MaxLength(30, { message: '搜索内容最长为30个字符' })
    @IsOptional()
    search?: string;

    @IsUUID(undefined, { message: '部门id格式错误', each: true })
    @IsOptional()
    system?: string;
}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateRoleDto {
    @MaxLength(30, { message: '角色名称的最大长度为30', always: true })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '角色名称不能为空' })
    name: string;

    @MaxLength(200, { message: '角色描述的长度不能超过200', always: true })
    @IsOptional({ always: true })
    description?: string;

    @IsExists({ entity: SystemEntity }, { message: '部门不存在', always: true })
    @IsUUID(undefined, { message: '部分id格式不对' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '角色所属部门不能为空' })
    system: string;

    @IsEnum(Status, {
        always: true,
        message: `角色状态只能是以下的值${Object.values(Status).join(', ')}`,
    })
    @IsOptional({ always: true })
    status?: Status;
}

@DTO_VALIDATION({ groups: ['update'] })
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @IsUUID(undefined, { groups: ['update'], message: '角色id格式错误' })
    @IsNotEmpty({ groups: ['update'], message: '角色id不能为空' })
    id!: string;
}
