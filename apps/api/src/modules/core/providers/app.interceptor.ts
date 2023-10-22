import {
    Injectable,
    ClassSerializerInterceptor,
    StreamableFile,
    PlainLiteralObject,
    CallHandler,
    ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassTransformOptions } from 'class-transformer';
import { isObject, isNil, isArray } from 'lodash';
import { Observable, map } from 'rxjs';

import { CustomResponse } from '../types';

@Injectable()
export class AppIntercepter<T> extends ClassSerializerInterceptor {
    constructor(protected reflector: Reflector) {
        super(reflector);
    }

    serialize(
        response: PlainLiteralObject | Array<PlainLiteralObject>,
        options: ClassTransformOptions,
    ): PlainLiteralObject | PlainLiteralObject[] {
        // 基本类型、非数组、文件流，直接返回
        if ((!isObject(response) && !isArray(response)) || response instanceof StreamableFile) {
            return response;
        }

        // 如果是响应数据是数组,则遍历对每一项进行序列化
        if (isArray(response)) {
            return (response as PlainLiteralObject[]).map((item) =>
                !isObject(item) ? item : this.transformToPlain(item, options),
            );
        }
        // 如果是分页数据,则对items中的每一项进行序列化
        if ('meta' in response && 'items' in response) {
            const items = !isNil(response.items) && isArray(response.items) ? response.items : [];
            return {
                ...response,
                items: (items as PlainLiteralObject[]).map((item) => {
                    return !isObject(item) ? item : this.transformToPlain(item, options);
                }),
            };
        }
        // 如果响应是个对象则直接序列化
        return this.transformToPlain(response, options);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<CustomResponse<T>> {
        // return next.handle().pipe(
        //     map((data) => ({
        //         statusCode: context.switchToHttp().getResponse().statusCode,
        //         message: this.reflector.get<string>('response_message', context.getHandler()) || '',
        //         data,
        //     })),
        // );

        return super.intercept(context, next).pipe(
            map((data) => ({
                statusCode: context.switchToHttp().getResponse().statusCode,
                message:
                    this.reflector.get<string>('response_message', context.getHandler()) ||
                    'success',
                data,
            })),
        );
    }
}
