import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    Length,
    MaxLength,
} from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import {
    IsExists,
    IsMatchPhone,
    IsPassword,
    IsUnique,
    IsUniqueExist,
} from '@/modules/database/constraints';
import { ResourceEntity, RoleEntity } from '@/modules/rbac/entities';
import { ListQueryDtoWithTrashed } from '@/modules/restful/dtos';

import { UserEntity } from '../entities';

@DTO_VALIDATION({ type: 'query' })
export class QueryUserDto extends ListQueryDtoWithTrashed {}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateUserDto {
    @ApiProperty({ description: '用户名称', maxLength: 100 })
    @MaxLength(100, { message: '用户名称长度不能超过100' })
    @IsOptional({ groups: ['update'] })
    @IsUniqueExist({ entity: UserEntity }, { groups: ['update'], message: '名称已被人使用' })
    @IsUnique({ entity: UserEntity }, { message: '用户名称重复', groups: ['create'] })
    @IsNotEmpty({ groups: ['create'], message: '用户名称不能为空' })
    name!: string;

    @ApiPropertyOptional({ description: '用户邮箱', example: 'aaa@gmail.com' })
    @MaxLength(100, { message: '用户昵称长度不能超过100' })
    @IsOptional({ always: true })
    nickname?: string;

    @ApiPropertyOptional({ description: '用户邮箱', example: 'aaa@gmail.com' })
    @IsUniqueExist({ entity: UserEntity }, { groups: ['update'], message: '邮箱已被人使用' })
    @IsUnique({ entity: UserEntity }, { groups: ['create'], message: '邮箱已被人使用' })
    @IsEmail(undefined, { message: '邮箱格式错误' })
    @IsOptional({ always: true })
    email?: string;

    @ApiPropertyOptional({ description: '用户自我介绍', example: '我是大帅比' })
    @MaxLength(300, { message: '自我介绍不能超过300个字符' })
    @IsOptional({ always: true })
    summary?: string;

    @ApiPropertyOptional({ description: '用户手机', example: '+86.11122223333' })
    @IsUniqueExist({ entity: UserEntity }, { groups: ['update'], message: '手机已被人使用' })
    @IsUnique({ entity: UserEntity }, { groups: ['create'], message: '手机已被人使用' })
    @IsMatchPhone('zh-CN', { strictMode: true }, { message: '手机格式错误' })
    @IsOptional({ always: true })
    phone?: string;

    @ApiProperty({ description: '用户密码', example: '123456aA!' })
    @Length(5, 30, {
        always: true,
        message: '密码的长度由5-30个字符',
    })
    @IsPassword(5, { message: '密码必须包含数字，小写字母，大写字母，特殊符号' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '用户密码不能为空' })
    password!: string;

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
