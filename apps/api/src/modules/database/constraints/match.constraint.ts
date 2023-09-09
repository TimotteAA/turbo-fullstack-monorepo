import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint()
export class IsMatchConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const { object }: { object: Record<string, any> } = args;
        const [matchProperty] = args.constraints;
        if (value !== object[matchProperty as string]) return false;
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `"${args.property}" must match "${args.constraints[0]}"`;
    }
}

/**
 * 判断Dto中两个字段是否一致
 * @param matchProperty 应该相等的字段
 * @param validationOptions
 */
export function IsMatch(matchProperty: string, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            // dto类
            target: object.constructor,
            // dto字段
            propertyName,
            options: validationOptions,
            constraints: [matchProperty],
            // 校验器
            validator: IsMatchConstraint,
        });
    };
}
