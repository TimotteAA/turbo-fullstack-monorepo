import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { UserEntity } from '../entities';

export const reqUser = createParamDecorator((_data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user as ClassToPlain<UserEntity> & { ssid: string };
});
