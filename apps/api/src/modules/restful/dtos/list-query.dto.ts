import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, Min, IsEnum } from 'class-validator';

import { toNumber } from 'lodash';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { SelectTrashMode } from '@/modules/database/constants';
import { PaginateOptions } from '@/modules/database/types';

@DTO_VALIDATION({ type: 'query' })
export class ListQueryDto implements PaginateOptions {
    @IsEnum(SelectTrashMode)
    @IsOptional()
    trashed?: SelectTrashMode;

    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据必须大于5' })
    @IsNumber()
    @IsOptional()
    limit = 5;
}
