import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { orderBy } from 'lodash';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { IsExists } from '@/modules/database/constraints';
import { ResourceEntity, RoleEntity } from '@/modules/rbac/entities';
import { ListQueryDtoWithTrashed } from '@/modules/restful/dtos';

import { UserOrderBy } from '../constants';

import { CommonUserDto } from './common.dto';

@DTO_VALIDATION({ type: 'query' })
export class QueryUserDto extends ListQueryDtoWithTrashed {
    @ApiPropertyOptional({
        description: '搜索关键词，比如用户名、昵称、邮箱、手机等',
    })
    @MaxLength(100, {
        always: true,
    })
    @IsOptional({ always: true })
    search?: string;

    @ApiPropertyOptional({
        description: '根据角色id过滤用户',
    })
    @IsExists({ entity: RoleEntity }, { message: '角色不存在' })
    @IsUUID(undefined, {
        message: '角色id不是uuid',
        always: true,
    })
    @IsOptional({
        always: true,
    })
    role?: string;

    @ApiPropertyOptional({
        description: '根据权限id过滤用户',
    })
    @IsExists({ entity: ResourceEntity }, { always: true, message: '权限不存在' })
    @IsUUID(undefined, {
        message: '权限id不是uuid',
        always: true,
    })
    @IsOptional({
        always: true,
    })
    permission?: string;

    @IsEnum(UserOrderBy, {
        message: `排序字段必须是${Object.values(orderBy)}`,
        always: true,
    })
    @IsOptional({ always: true })
    orderBy?: UserOrderBy;
}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateUserDto extends CommonUserDto {
    @ApiPropertyOptional({ description: '用户的角色id数组' })
    @IsExists(
        { entity: RoleEntity },
        {
            message: '角色不存在',
            always: true,
            each: true,
        },
    )
    @IsUUID(undefined, { message: '角色id格式错误', each: true, always: true })
    @IsOptional({ always: true })
    roles: string[];

    @ApiPropertyOptional({ description: '用户的权限id数组' })
    @IsExists(
        { entity: ResourceEntity },
        {
            message: '权限不存在',
            always: true,
            each: true,
        },
    )
    @IsUUID(undefined, { message: '权限id格式错误', each: true, always: true })
    @IsOptional({ always: true })
    resources: string[];
}

@DTO_VALIDATION({ groups: ['update'] })
export class UdpateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ description: '用户id' })
    @IsUUID(undefined, { message: '用户id格式不对' })
    @IsNotEmpty({ groups: ['update'], message: '用户id不能为空' })
    id!: string;

    @ApiProperty({ description: '账号是否可用' })
    @IsBoolean({ message: '值不是布尔类型' })
    @IsOptional({ groups: ['update'] })
    actived?: boolean;
}

@DTO_VALIDATION()
export class BlockUserDto extends PickType(UdpateUserDto, ['id']) {}
