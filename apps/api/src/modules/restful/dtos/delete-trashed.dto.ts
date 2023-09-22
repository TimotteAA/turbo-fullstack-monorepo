import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { toBoolean } from '@/modules/core/utils';

@DTO_VALIDATION()
export class DeleteWithTrashDto {
    @IsUUID(undefined, {
        message: 'id不是uuid格式',
        each: true,
    })
    @IsNotEmpty({ each: true, message: 'id不能为空' })
    ids: string[];

    @Transform(({ value }) => toBoolean(value))
    @IsOptional()
    trashed?: boolean;
}
