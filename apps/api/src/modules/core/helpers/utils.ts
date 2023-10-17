import { Module, ModuleMetadata, Type } from '@nestjs/common';

/**
 * 创建一个动态模块，其实是主动执行Module装饰器
 * @param target
 * @param metaSetter
 */
export function CreateModule(
    target: string | Type<any>,
    metaSetter: () => ModuleMetadata = () => ({}),
): Type<any> {
    let ModuleClass: Type<any>;
    if (typeof target === 'string') {
        ModuleClass = class {};
        Object.defineProperty(ModuleClass, 'name', { value: target });
    } else {
        ModuleClass = target;
    }
    // 主动执行装饰器
    Module(metaSetter())(ModuleClass);
    return ModuleClass;
}
