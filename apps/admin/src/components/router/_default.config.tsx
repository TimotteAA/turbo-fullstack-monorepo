import { RouterConfig } from './types';

/**
 * 默认的路由配置
 * @returns
 */
export const getDefaultRouterConfig: <M extends RecordNever>() => RouterConfig<M> = () => ({
    basepath: '/',
    hash: false,
    loading: () => <div>加载中...</div>,
    routes: [],
    auth: { enabled: true, path: '/auth/login', page: 'auth/login' },
});
