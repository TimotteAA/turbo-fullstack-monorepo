import { Paramtype, SetMetadata } from '@nestjs/common';
import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';
import { TransformOptions } from 'class-transformer';

import { DTO_VALIDATION_OPTIONS } from '../constants';

/**
 * 自定义dto装饰器工厂
 * @param options 自定义配置
 */
export const DTO_VALIDATION = (
    options?: ValidatorOptions & {
        transformOptions?: TransformOptions;
    } & {
        type?: Paramtype;
    },
) => SetMetadata(DTO_VALIDATION_OPTIONS, options);
