import { IsNotEmpty, IsUUID } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';

@DTO_VALIDATION()
export class DeleteDto {
    @IsUUID(undefined, {
        message: 'id不是uuid格式',
        each: true,
    })
    @IsNotEmpty({ each: true, message: 'id不能为空' })
    ids: string[] = [];
}
