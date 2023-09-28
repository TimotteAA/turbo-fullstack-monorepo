import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { toBoolean } from '@/modules/core/utils';

@Injectable()
export class QueryDetailDto {
    @ApiPropertyOptional({
        type: Boolean,
        description: '是否查询软删除数据详情',
        default: false,
    })
    @IsBoolean()
    @Transform(({ value }) => toBoolean(value))
    @IsOptional()
    trashed?: boolean;
}
