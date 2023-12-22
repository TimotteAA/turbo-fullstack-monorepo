import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Length, MaxLength } from 'class-validator';

import { IsMatchPhone, IsPassword, IsUnique, IsUniqueExist } from '@/modules/database/constraints';

import { UserEntity } from '../entities';

export class CommonUserDto {
    @ApiProperty({ description: '用户名称', maxLength: 100 })
    @MaxLength(100, { message: '用户名称长度不能超过100' })
    @IsOptional({ groups: ['update', 'updateUser'] })
    @IsUniqueExist(
        { entity: UserEntity },
        { groups: ['update', 'updateUser'], message: '名称已被人使用' },
    )
    @IsUnique({ entity: UserEntity }, { message: '用户名称重复', groups: ['create'] })
    @IsNotEmpty({ groups: ['create'], message: '用户名称不能为空' })
    name!: string;

    @ApiPropertyOptional({ description: '用户邮箱', example: 'aaa@gmail.com' })
    @MaxLength(100, { message: '用户昵称长度不能超过100', always: true })
    @IsOptional({ always: true })
    nickname?: string;

    @ApiPropertyOptional({ description: '用户邮箱', example: 'aaa@gmail.com' })
    @IsUniqueExist({ entity: UserEntity }, { groups: ['update'], message: '邮箱已被人使用' })
    @IsUnique({ entity: UserEntity }, { groups: ['create'], message: '邮箱已被人使用' })
    @IsEmail(undefined, { message: '邮箱格式错误', always: true })
    @IsOptional({ always: true })
    email?: string;

    @ApiPropertyOptional({ description: '用户自我介绍', example: '我是大帅比' })
    @MaxLength(300, { message: '自我介绍不能超过300个字符', always: true })
    @IsOptional({ always: true })
    summary?: string;

    @ApiPropertyOptional({ description: '用户手机', example: '+86.11122223333' })
    @IsUniqueExist({ entity: UserEntity }, { groups: ['update'], message: '手机已被人使用' })
    @IsUnique({ entity: UserEntity }, { groups: ['create'], message: '手机已被人使用' })
    @IsMatchPhone('zh-CN', { strictMode: true }, { message: '手机格式错误', always: true })
    @IsOptional({ always: true })
    phone?: string;

    @ApiProperty({ description: '用户密码', example: '123456aA!' })
    @Length(5, 30, {
        always: true,
        message: '密码的长度由5-30个字符',
    })
    @IsPassword(5, { message: '密码必须包含数字，小写字母，大写字母，特殊符号', always: true })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create', 'updatePassword'], message: '用户密码不能为空' })
    password!: string;
}
