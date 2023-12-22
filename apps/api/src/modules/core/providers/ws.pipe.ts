import { ArgumentMetadata, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { AppPipe } from './app.pipe';

/**
 * 按照文档，wspipe和appPipe没有啥区别，只不过一个抛出WsException
 */
@Injectable()
export class WsPipe extends AppPipe {
    transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        try {
            return super.transform(value, metadata);
        } catch (error: any) {
            const err = error.response ?? error;
            throw new WsException(err);
        }
    }
}
