import { Controller, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

import { ResponseMessage } from '@/modules/core/decorators';
import { ALLOW_GUEST } from '@/modules/rbac/decorators/guest.decorator';
import { Depends } from '@/modules/restful/decorators';

import { reqUser } from '../decorators';
import { UserEntity } from '../entities';
import { LocalAuthGuard } from '../guards';
import { AuthService } from '../services';
import { UserModule } from '../user.module';

@Depends(UserModule)
@Controller('auth')
@ALLOW_GUEST(true)
export class AuthController {
    constructor(protected readonly authService: AuthService) {}

    @Post('login')
    @ALLOW_GUEST(true)
    @UseGuards(LocalAuthGuard)
    async login(@Req() request: FastifyRequest) {
        // 颁发jwt token
        return this.authService.login((request as any).user.id, request.headers['user-agent']);
    }

    @ApiOkResponse({ description: '用户注册，并直接登录' })
    @Post()
    async register(@reqUser() user: ClassToPlain<UserEntity>) {
        return { user };
    }

    @ALLOW_GUEST(true)
    @Post('/refresh')
    async refreshToken(@Request() request: FastifyRequest) {
        return this.authService.refreshToken(request);
    }

    @ResponseMessage('退出成功')
    @Post('/logout')
    async logout(@reqUser() user: ClassToPlain<UserEntity> & { ssid: string }): Promise<null> {
        await this.authService.logout(user.ssid);
        return null;
    }
}
