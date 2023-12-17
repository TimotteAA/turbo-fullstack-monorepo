import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

import { ResponseMessage } from '@/modules/core/decorators';
import { ALLOW_GUEST } from '@/modules/rbac/decorators/guest.decorator';
import { Depends } from '@/modules/restful/decorators';

import { reqUser } from '../decorators';
import { UserEntity } from '../entities';
import { LocalAuthGuard } from '../guards';
import { AuthService, UserService } from '../services';
import { UserModule } from '../user.module';

import { UserLoginDto, UserRegisterDto } from '../dtos/auth.dto';

@ApiTags('账户操作')
@Depends(UserModule)
@Controller('auth')
export class AuthController {
    constructor(
        protected readonly authService: AuthService,
        protected readonly userService: UserService,
    ) {}

    @ApiOperation({ summary: '用户登录，可以通过用户名、手机、邮箱+密码登录' })
    @Post('/login')
    @ALLOW_GUEST(true)
    @UseGuards(LocalAuthGuard)
    async login(@Req() request: FastifyRequest, @Body() _data: UserLoginDto) {
        // 颁发jwt token
        return this.authService.login((request as any).user.id, request.headers['user-agent']);
    }

    @ApiOperation({ summary: '用户注册' })
    @ALLOW_GUEST(true)
    @Post('/register')
    async register(@Body() data: UserRegisterDto) {
        return this.authService.register(data);
    }

    @ApiOperation({ summary: '退出登录' })
    @ResponseMessage('退出成功')
    @Post('/logout')
    async logout(@reqUser() user: ClassToPlain<UserEntity> & { ssid: string }): Promise<null> {
        await this.authService.logout(user.ssid);
        return null;
    }
}
