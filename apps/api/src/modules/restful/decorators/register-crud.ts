import { Type } from '@nestjs/common';

import { CRUD_OPTIONS_REGISTER } from '../constants';
import { BaseController } from '../controller';
import { CrudOptionsRegister } from '../types';

export const RegisterCrud =
    (factory: CrudOptionsRegister) =>
    <T extends BaseController<any>>(Target: Type<T>) =>
        Reflect.defineMetadata(CRUD_OPTIONS_REGISTER, factory, Target);
