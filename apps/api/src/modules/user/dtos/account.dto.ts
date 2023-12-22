import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';

import { CommonUserDto } from './common.dto';

@DTO_VALIDATION({ groups: ['updateUser'] })
export class UpdateAccountDto extends PickType(CommonUserDto, ['name', 'nickname', 'summary']) {}

@DTO_VALIDATION({ groups: ['updatePassword'] })
export class UpdatePasswordDto extends PickType(CommonUserDto, ['password']) {
    @ApiProperty({ description: '用户之前绑定的密码' })
    @IsNotEmpty({ groups: ['updatePassword'], message: '旧密码不能为空' })
    oldPassword: string;
}
