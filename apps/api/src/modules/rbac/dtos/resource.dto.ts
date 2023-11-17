import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength, ValidateIf } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { IsExists } from '@/modules/database/constraints';

import { ResourceType, Status } from '../constants';
import { ResourceEntity } from '../entities';

@DTO_VALIDATION({ groups: ['create'] })
export class CreateResourceDto {
    @MaxLength(30, { message: '资源名称的最大长度不能超过30', always: true })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '资源名称不能为空' })
    name: string;

    @MaxLength(300, { message: '资源键的最大长度不能超过300', always: true })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '资源键不能为空' })
    key: string;

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
}

@DTO_VALIDATION({ groups: ['update'] })
export class UpdateResourceDto extends PartialType(CreateResourceDto) {
    @IsUUID(undefined, { groups: ['update'], message: '资源id格式错误' })
    @IsNotEmpty({ groups: ['update'], message: '资源id不能为空' })
    id!: string;
}
