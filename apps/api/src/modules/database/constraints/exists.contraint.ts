import { Injectable } from '@nestjs/common';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { isNil } from 'lodash';
import { DataSource, ObjectType } from 'typeorm';

/**
 * condition类型
 */
export interface Condition {
    entity: ObjectType<any>;
    /**
     * 查询id
     */
    field?: string;
}

@ValidatorConstraint({ async: true, name: 'data-exists' })
@Injectable()
export class IsExistsConstraint implements ValidatorConstraintInterface {
    constructor(protected dataSource: DataSource) {}

    async validate(value: string, args: ValidationArguments) {
        // 有些uuid字段可能是null
        if (!value) return true;
        const [condition] = args.constraints as Condition[];
        const { entity, field } = condition;

        const repo = this.dataSource.getRepository(entity);
        let findField = 'id';
        if (!isNil(field)) {
            findField = field;
        }
        const queryCondition = {
            [findField]: value,
        };
        const item = await repo.findBy(queryCondition);
        return !isNil(item);
    }

    defaultMessage(args: ValidationArguments) {
        return `"${args.property}" of "${args.value}" does not exist`;
    }
}

/**
 * 判断Dto中两个字段是否一致
 * @param matchProperty 应该相等的字段
 * @param validationOptions
 */
export function IsExists(constraint: Condition, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            // dto类
            target: object.constructor,
            // dto字段
            propertyName,
            options: validationOptions,
            constraints: [constraint],
            // 校验器
            validator: IsExistsConstraint,
        });
    };
}
