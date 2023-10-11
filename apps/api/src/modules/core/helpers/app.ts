import { BadGatewayException, ModuleMetadata, Type } from '@nestjs/common';

import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { useContainer } from 'class-validator';

import { isNil } from 'lodash';

import { ConfigModule } from '@/modules/config/config.module';
import { Configure } from '@/modules/config/configure';

import { ConfigureFactory, ConfigureRegister } from '@/modules/config/types';

import { getDefaultAppConfig } from '../constants';
import { CoreModule } from '../core.module';
import { AppFilter, AppIntercepter, AppPipe } from '../providers';
import { App, AppConfig, CreateOptions } from '../types';

import { CreateModule } from './utils';

export const apps: Record<string, App> = {};

export const createApp = (name: string, options: CreateOptions) => async (): Promise<App> => {
    const { config, builder } = options;
    // 设置app的配置类实例
    apps[name] = { configure: new Configure() };
    // 初始化配置实例
    await apps[name].configure.init(config.factories, config.storage);
    // 如果没有app配置则报错
    if (!apps[name].configure.has('app')) {
        throw new BadGatewayException('App config not exists!');
    }
    // 创建启动核心模块
    const BootModule = await createBootModule(apps[name].configure, options);
    // 创建app的容器实例
    apps[name].container = await builder({
        configure: apps[name].configure,
        BootModule,
    });
    // 设置api前缀
    if (apps[name].configure.has('app.prefix')) {
        apps[name].container.setGlobalPrefix(
            await apps[name].configure.get<string>('app.prefix', 'api'),
        );
    }
    // 为class-validator添加容器以便在自定义约束中可以注入dataSource等依赖
    useContainer(apps[name].container.select(BootModule), {
        fallbackOnErrors: true,
    });

    return apps[name];
};

/**
 * 创建一个启动模块，类似于AppModule
 * @param configure
 * @param options
 */
export async function createBootModule(
    configure: Configure,
    options: Pick<CreateOptions, 'globals' | 'imports'>,
): Promise<Type<any>> {
    const { globals = {}, imports: moduleCreator } = options;
    // 获取需要导入的模块
    const modules = await moduleCreator(configure);
    // 添加核心模块、配置模块
    const imports: ModuleMetadata['imports'] = [
        ...modules,
        CoreModule.forRoot(),
        ConfigModule.forRoot(configure),
    ];
    // 配置全局提供者
    const providers: ModuleMetadata['providers'] = [];
    if (globals.pipe !== null) {
        const pipe = globals.pipe
            ? globals.pipe(configure)
            : new AppPipe({
                  transform: true,
                  whitelist: true,
                  forbidNonWhitelisted: true,
                  forbidUnknownValues: true,
                  validationError: { target: false },
              });
        providers.push({
            provide: APP_PIPE,
            useValue: pipe,
        });
    }
    if (globals.interceptor !== null) {
        providers.push({
            provide: APP_INTERCEPTOR,
            useClass: globals.interceptor ?? AppIntercepter,
        });
    }
    if (globals.filter !== null) {
        providers.push({
            provide: APP_FILTER,
            useClass: AppFilter,
        });
    }

    // 创建启动模块
    return CreateModule('BootModule', () => {
        const meta: ModuleMetadata = {
            imports,
            providers,
        };
        return meta;
    });
}

/**
 * 启动一个应用
 * @param creator
 * @param listend 对应用启动后做监听
 */
export const startApp = async (creator: () => Promise<App>, listend?: (app: App) => () => void) => {
    const app = await creator();
    const { container, configure } = app;
    const { port, host } = await configure.get<AppConfig>('app');
    await container.listen(port, host, listend(app));
};

/**
 * 应用配置工厂
 */
export const createAppConfig: (
    register: ConfigureRegister<RePartial<AppConfig>>,
) => ConfigureFactory<AppConfig> = (register) => ({
    register,
    defaultRegister: (configure) => getDefaultAppConfig(configure),
    hook: (_configure: Configure, value) => {
        if (isNil(value.url))
            value.url = `${value.https ? 'https' : 'http'}://${value.host}:${value.port}`;
        return value;
    },
});
