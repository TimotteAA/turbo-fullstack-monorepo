import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    ValidateIf,
} from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { toBoolean } from '@/modules/core/utils';
import { IsExists } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';

import { ResourceType, Status } from '../constants';
import { ResourceEntity } from '../entities';

@DTO_VALIDATION({ type: 'query' })
export class QueryResoureceDto extends ListQueryDto {}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateResourceDto {
    @MaxLength(30, { message: '资源名称的最大长度不能超过30', always: true })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '资源名称不能为空' })
    name: string;

    @MaxLength(300, { message: '资源的描述最大长度不能超过300', always: true })
    @IsOptional({ always: true })
    description?: string;

    @IsEnum(Status, {
        always: true,
        message: `资源状态只能是以下的值${Object.values(Status).join(', ')}`,
    })
    @IsOptional({ always: true })
    status?: Status = Status.ENABLED;

    @IsEnum(ResourceType, {
        always: true,
        message: `资源类型只能是以下的值${Object.values(ResourceType).join(', ')}`,
    })
    @IsOptional({ always: true })
    type?: ResourceType = ResourceType.MENU;

    @IsExists({ entity: ResourceEntity }, { message: '父资源不存在', always: true })
    @IsUUID(undefined, { message: '父资源的id格式错误' })
    @ValidateIf((value) => value.parent !== null && value.parent !== undefined)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value !== 'null' ? value : null))
    parent?: string;

    // 下面的属性和type有关系
    @IsOptional({ always: true })
    @IsString({ always: true })
    @ValidateIf((value) => value.type !== null && value.type !== ResourceType.ACTION, {
        always: true,
    })
    icon?: string;

    @IsOptional({ always: true })
    @IsString({ always: true })
    @ValidateIf((value) => value.type !== null && value.type !== ResourceType.ACTION, {
        always: true,
    })
    path?: string;

    @IsOptional({ always: true })
    @IsString({ always: true })
    @ValidateIf((value) => value.type !== null && value.type !== ResourceType.ACTION, {
        always: true,
    })
    component?: string;

    @IsBoolean({ always: true })
    @IsOptional({ always: true })
    @Transform(({ value }) => toBoolean(value))
    @ValidateIf((value) => value.type !== null && value.type !== ResourceType.ACTION, {
        always: true,
    })
    external?: boolean;

    @IsBoolean({ always: true })
    @IsOptional({ always: true })
    @Transform(({ value }) => toBoolean(value))
    @ValidateIf((value) => value.type !== null && value.type !== ResourceType.ACTION, {
        always: true,
    })
    show?: boolean;

    @IsBoolean({ always: true })
    @IsOptional({ always: true })
    @Transform(({ value }) => toBoolean(value))
    @ValidateIf((value) => value.type !== null && value.type === ResourceType.MENU, {
        always: true,
    })
    keepAlive?: boolean;

    @IsOptional({ always: true })
    @IsString({ always: true })
    @ValidateIf((value) => value.type !== null && value.type === ResourceType.ACTION, {
        always: true,
    })
    permission?: string;
}

@DTO_VALIDATION({ groups: ['update'] })
export class UpdateResourceDto extends PartialType(CreateResourceDto) {
    @IsUUID(undefined, { groups: ['update'], message: '资源id格式错误' })
    @IsNotEmpty({ groups: ['update'], message: '资源id不能为空' })
    id!: string;
}
