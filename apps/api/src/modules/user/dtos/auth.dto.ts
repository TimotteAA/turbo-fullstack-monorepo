import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { IsMatch } from '@/modules/database/constraints';

/**
 * 用户名+密码注册
 */
@DTO_VALIDATION()
export class UserRegisterDto {
    @ApiProperty({ description: '用户名' })
    @IsNotEmpty({ message: '用户名称不能为空', always: true })
    name!: string;

    @ApiProperty({ description: '用户昵称' })
    @IsOptional({ always: true })
    nickname?: string;

    @ApiProperty({ description: '登录密码' })
    @IsNotEmpty({ message: '登录密码不能为空', always: true })
    password!: string;

    @ApiProperty({ description: '确认密码' })
    @IsMatch('password', { message: '两次密码不一致', always: true })
    @IsNotEmpty({ message: '确认密码不能为空', always: true })
    repassword!: string;
}

/**
 * 用户名+密码登录
 */
@DTO_VALIDATION()
export class UserLoginDto {
    @ApiProperty({ description: '登录名' })
    @IsNotEmpty({ message: '登录凭证不能为空' })
    /**
     * 必须和local stragety的用户名字段一样！！！！！
     */
    credential!: string;

    @ApiProperty({ description: '登录密码' })
    @IsNotEmpty({ message: '登录密码不能为空' })
    password!: string;
}
