import { BadRequestException, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { ValidationError, validateOrReject } from 'class-validator';

import { UserLoginDto } from '../dtos/auth.dto';

/**
 * 在gurad中对body进行校验
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    async canActivate(context: ExecutionContext) {
        // 拿到body
        const request = context.switchToHttp().getRequest();
        // 由于使用了class-transform，而原生的guard不支持校验，因此在此加入校验的过程
        try {
            await validateOrReject(plainToClass(UserLoginDto, request.body ?? {}), {
                // 不暴露校验的对象
                validationError: {
                    target: false,
                },
            });
        } catch (errors) {
            const messages = Object.values(
                (errors as ValidationError[])
                    // constraints是校验的错误信息，key是字段，value是信息
                    .map((error) => error.constraints ?? {})
                    // 把对象累计起来
                    .reduce((o, n) => ({ ...o, ...n }), {}),
            );
            throw new BadRequestException(messages);
        }
        // 如果出错，会直接报错
        return super.canActivate(context) as any;
    }
}
