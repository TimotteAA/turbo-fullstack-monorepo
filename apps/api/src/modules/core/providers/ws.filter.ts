import { ArgumentsHost, Catch } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { MESSAGES } from '@nestjs/core/constants';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

/**
 * 在原生基础上，针对ws的异常，向客户端发送exception数据
 */
@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        super.catch(exception, host);
    }

    handleError(client: any, exception: any) {
        const result = super.handleError(client, exception);
        const error = exception;
        const message = isObject(error)
            ? error
            : {
                  status: 'error',
                  message: error,
              };
        // 比父类中多的代码
        client.send(JSON.stringify({ event: 'exception', data: message }));
        return result;
    }

    handleUnknownError(exception: any, client: any) {
        const result = super.handleUnknownError(exception, client);
        client.send(
            JSON.stringify({
                event: 'exception',
                data: {
                    status: 'error',
                    message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
                },
            }),
        );
        return result;
    }
}
