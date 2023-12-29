import { SetMetadata } from '@nestjs/common';

import { MISSION_DECORATOR_KEY } from '../constants';

/**
 * 是否允许匿名访问的装饰器
 * @param guest
 */
export const MISSION = () => SetMetadata(MISSION_DECORATOR_KEY, true);
