import { Reflector } from '@nestjs/core';

/**
 * 是否允许匿名访问的装饰器
 * @param guest
 */
export const ALLOW_GUEST = Reflector.createDecorator<boolean>();
