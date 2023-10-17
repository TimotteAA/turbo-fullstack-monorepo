import { SetMetadata, Type } from '@nestjs/common';

import { CONTROLLER_DEPENDS } from '../constants';

/**
 * 添加够早的路由模块依赖模块（类似于imports）
 * @param depends
 */
export const Depends = (depends: Type<any>[]) => SetMetadata(CONTROLLER_DEPENDS, depends);
