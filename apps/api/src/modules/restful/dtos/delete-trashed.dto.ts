import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { toBoolean } from '@/modules/core/utils';

@DTO_VALIDATION()
export class DeleteWithTrashDto {
    @ApiProperty({
        description: '删除的目标id数组',
        type: Array,
    })
    @IsUUID(undefined, {
        message: 'id不是uuid格式',
        each: true,
    })
    @IsNotEmpty({ each: true, message: 'id不能为空' })
    ids: string[];

    @ApiPropertyOptional({
        description: '是否是软删除',
        type: Boolean,
        default: false,
    })
    @Transform(({ value }) => toBoolean(value))
    @IsOptional()
    trashed?: boolean;
}
