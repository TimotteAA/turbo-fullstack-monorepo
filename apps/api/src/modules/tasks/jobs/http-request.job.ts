import { Injectable } from '@nestjs/common';

import { MISSION } from '@/modules/task/decorator';

/**
 * Api接口请求类型任务
 */
@MISSION()
@Injectable()
export class HttpRequestJob {
    /**
     * 发起请求
     * @param config {AxiosRequestConfig}
     */
    async handle(config: unknown): Promise<void> {
        console.log('hahahaha');
    }
}
