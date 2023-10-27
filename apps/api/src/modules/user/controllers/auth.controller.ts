import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { Depends } from '@/modules/restful/decorators';

import { LocalAuthGuard } from '../guards';
import { UserModule } from '../user.module';

@Depends(UserModule)
@Controller('auth')
export class AuthController {
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() request: any) {
        // 颁发jwt token
        return request.user;
    }
}
