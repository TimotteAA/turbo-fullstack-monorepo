import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, MaxLength, Min } from 'class-validator';
import { toNumber } from 'lodash';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { ListQueryDto } from '@/modules/restful/dtos';

@DTO_VALIDATION({ type: 'query' })
export class QueryTagDto extends ListQueryDto {}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateTagDto {
    @ApiProperty({ description: '标签名称' })
    @MaxLength(30, {
        message: '$property长度不能超过30',
        always: true,
    })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '标签名称不能为空' })
    name!: string;

    @ApiPropertyOptional({ description: '标签描述' })
    @MaxLength(50, {
        message: '标签描述$property长度不能超过50',
        always: true,
    })
    @IsOptional({ always: true })
    description?: string;

    @ApiPropertyOptional({ description: '标签分页排序值' })
    @Transform(({ value }) => toNumber(value))
    @Min(0, {
        message: '$property最小值为0',
        always: true,
    })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;
}

@DTO_VALIDATION({ groups: ['update'] })
export class UpdateTagDto extends PartialType(CreateTagDto) {
    @ApiProperty({ description: '待更新的标签id' })
    @IsUUID(undefined, {
        message: '标签id不是uuid格式',
    })
    @IsNotEmpty({ groups: ['update'], message: '标签id必须指定' })
    id!: string;
}
