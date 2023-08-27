import { SetMetadata } from '@nestjs/common';
import { CUSTOM_REPOSITORY_METADATA } from '../constants';
import { ObjectType } from 'typeorm';

/**
 * 在自定义repo上使用
 * @param entity，repo对应entity
 */
export const CUSTOM_REPOSITORY = <E extends ObjectType<any>>(entity: E) =>
    SetMetadata(CUSTOM_REPOSITORY_METADATA, entity);
