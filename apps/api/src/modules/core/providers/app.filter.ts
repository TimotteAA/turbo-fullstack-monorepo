import { ArgumentsHost, Catch, HttpException, HttpStatus, Type } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { isObject } from 'lodash';
// typeorm会引起500的异常
import { EntityPropertyNotFoundError, QueryFailedError, EntityNotFoundError } from 'typeorm';
// import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

/**
 * 全局过滤器,用于响应自定义异常
 */
@Catch()
export class AppFilter<T = Error> extends BaseExceptionFilter<T> {
    /**
     * 这些错误会导致服务器500的挂逼
     */
    protected resExceptions: Array<
        { class: Type<Error>; status?: number; message?: string } | Type<Error>
    > = [
        { class: EntityNotFoundError, status: HttpStatus.NOT_FOUND, message: '系统错误' },
        { class: QueryFailedError, status: HttpStatus.BAD_REQUEST, message: '系统错误' },
        { class: EntityPropertyNotFoundError, status: HttpStatus.BAD_REQUEST, message: '系统错误' },
    ];

    // eslint-disable-next-line consistent-return
    catch(exception: T, host: ArgumentsHost) {
        console.log('exception ', exception);
        // 源码内容
        const applicationRef =
            this.applicationRef || (this.httpAdapterHost && this.httpAdapterHost.httpAdapter)!;
        // 是否在自定义的异常处理类列表中
        const resException = this.resExceptions.find((item) =>
            'class' in item ? exception instanceof item.class : exception instanceof item,
        );
        // 如果不在自定义异常处理类列表也没有继承自HttpException，后半部分来自源码
        if (!resException && !(exception instanceof HttpException)) {
            return this.handleUnknownError(exception, host, applicationRef);
        }
        let res: string | object = '';
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (exception instanceof HttpException) {
            res = exception.getResponse();
            status = exception.getStatus();
        } else if (resException) {
            // 如果在自定义异常处理类列表中
            const e = exception as unknown as Error;
            res = e.message;
            // 盖掉原生的typeorm异常消息
            if ('class' in resException && resException.message) {
                res = resException.message;
            }
            if ('class' in resException && resException.status) {
                status = resException.status;
            }
        }
        const message = isObject(res)
            ? res
            : {
                  statusCode: status,
                  message: res,
              };
        applicationRef!.reply(host.getArgByIndex(1), message, status);
    }
}
