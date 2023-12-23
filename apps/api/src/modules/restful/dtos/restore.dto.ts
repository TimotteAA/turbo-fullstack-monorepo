import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';

/**
 * 批量恢复验证
 */
@DTO_VALIDATION()
export class RestoreDto {
    @ApiProperty({ description: '恢复的entity id数组' })
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式错误',
    })
    @IsDefined({
        each: true,
        message: 'ID必须指定',
    })
    ids: string[] = [];
}
