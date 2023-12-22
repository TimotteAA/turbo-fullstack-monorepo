import { Body, Controller, Get, Patch, SerializeOptions } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';

import { reqUser } from '../decorators';
import { UdpateUserDto } from '../dtos';
import { UserEntity } from '../entities';
import { AuthService, UserService } from '../services';
import { UserModule } from '../user.module';

import { UpdatePasswordDto } from '../dtos/account.dto';

@Depends(UserModule)
@ApiBearerAuth()
@ApiTags('账户相关操作')
@Controller('account')
export class AccountController {
    constructor(
        protected userService: UserService,
        protected authService: AuthService,
    ) {}

    @SerializeOptions({ groups: ['user-personal-profile'] })
    @ApiOperation({ summary: '查看账户详情' })
    @Get('profile')
    async profile(@reqUser() user: ClassToPlain<UserEntity>) {
        return this.userService.detail(user.id);
    }

    @SerializeOptions({ groups: ['user-personal-proile'] })
    @Patch()
    @ApiOperation({ summary: '更新账户信息' })
    async update(@reqUser() user: ClassToPlain<UserEntity>, @Body() data: UdpateUserDto) {
        return this.userService.update({
            id: user.id,
            name: data.name,
            nickname: data.nickname,
            summary: data.summary,
        });
    }

    @Patch('password')
    @ApiOperation({ summary: '更新密码' })
    async updatePassword(
        @reqUser() user: ClassToPlain<UserEntity>,
        @Body() data: UpdatePasswordDto,
    ) {
        return this.authService.updatePassword(user.id, data);
    }
}
