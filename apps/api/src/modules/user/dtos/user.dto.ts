import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { IsMatchPhone, IsPassword, IsUnique } from '@/modules/database/constraints';
import { ListQueryDtoWithTrashed } from '@/modules/restful/dtos';

import { UserEntity } from '../entities';

@DTO_VALIDATION({ type: 'query' })
export class QueryUserDto extends ListQueryDtoWithTrashed {}

@DTO_VALIDATION()
export class CreateUserDto {
    @ApiProperty({ description: '用户名称', maxLength: 100 })
    @MaxLength(100, { message: '用户名称长度不能超过100' })
    @IsOptional({ groups: ['update'] })
    @IsUnique(
        { entity: UserEntity, prototype: 'name' },
        { message: '用户名称重复', groups: ['create'] },
    )
    @IsNotEmpty({ groups: ['create'], message: '用户名称不能为空' })
    name!: string;

    @ApiPropertyOptional({ description: '用户邮箱', example: 'aaa@gmail.com' })
    @MaxLength(100, { message: '用户昵称长度不能超过100' })
    @IsOptional({ always: true })
    nickname?: string;

    @ApiPropertyOptional({ description: '用户邮箱', example: 'aaa@gmail.com' })
    @IsEmail(undefined, { message: '邮箱格式错误' })
    @IsOptional({ always: true })
    email?: string;

    @ApiPropertyOptional({ description: '用户自我介绍', example: '我是大帅比' })
    @MaxLength(300, { message: '自我介绍不能超过300个字符' })
    @IsOptional({ always: true })
    summary?: string;

    @ApiPropertyOptional({ description: '用户手机', example: '+86.11122223333' })
    @IsMatchPhone('zh-CN', { strictMode: true }, { message: '手机格式错误' })
    @IsOptional({ always: true })
    phone?: string;

    @ApiProperty({ description: '用户密码', example: '123456aA!' })
    @IsPassword(5, { message: '密码必须包含数字，小写字母，大写字母，特殊符号' })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '用户密码不能为空' })
    password!: string;
}

@DTO_VALIDATION()
export class UdpateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ description: '用户id' })
    @IsUUID(undefined, { message: '用户id格式不对' })
    @IsNotEmpty({ groups: ['update'], message: '用户id不能为空' })
    id!: string;
}

@DTO_VALIDATION()
export class BlockUserDto extends PickType(UdpateUserDto, ['id']) {}
