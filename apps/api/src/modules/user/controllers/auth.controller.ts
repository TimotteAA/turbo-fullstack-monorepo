import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

import { Depends } from '@/modules/restful/decorators';

import { LocalAuthGuard } from '../guards';
import { AuthService } from '../services';
import { UserModule } from '../user.module';

@Depends(UserModule)
@Controller('auth')
export class AuthController {
    constructor(protected readonly authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() request: FastifyRequest) {
        // 颁发jwt token
        return this.authService.login((request as any).user.id, request.headers['user-agent']);
    }
}
