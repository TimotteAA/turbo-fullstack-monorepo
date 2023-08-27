import { has } from 'lodash';
import pMinDelay from 'p-min-delay';
import { timeout } from 'promise-timeout';
import { FC, lazy } from 'react';
import { Navigate, useLocation } from 'react-router';

/**
 * 根据正则和glob递归获取符合reg的所有动态页面导入映射
 * [key:bar/foo]: () => import('{起始目录: 如pages}/bar/foo.blade.tsx')
 * @param imports 需要遍历的路径规则,支持glob
 * @param reg 用于匹配出key的正则表达式
 *
 * 使用示例：
 *
 * 假设你有以下动态导入的模块：
 *
 * const imports = {
 *   'path/to/module1': () => import('./path/to/module1'),
 *   'path/to/module2': () => import('./path/to/module2'),
 *   'path/other/module3': () => import('./path/other/module3'),
 * };
 *
 * 你想要筛选出所有路径中包含'to'的模块，可以这样使用这个函数：
 *
 * const reg = /^path\/to\/(.*)$/;
 * const modules = getAsyncImports(imports, reg);
 *
 * 最后，modules将会是：
 *
 * {
 *   'module1': () => import('./path/to/module1'),
 *   'module2': () => import('./path/to/module2'),
 * }
 */
const getAsyncImports = (imports: Record<string, () => Promise<any>>, reg: RegExp) => {
    return Object.keys(imports)
        .map((key) => {
            const names = reg.exec(key);
            return Array.isArray(names) && names.length >= 2
                ? { [names[1]]: imports[key] }
                : undefined;
        })
        .filter((m) => !!m)
        .reduce((o, n) => ({ ...o, ...n }), []) as unknown as Record<string, () => Promise<any>>;
};

/**
 * 匹配所有views下的页面
 */
export const pages = getAsyncImports(
    import.meta.glob('../../views/**/*.page.{tsx,jsx}'),
    /..\/\..\/views\/([\w+.?/?]+)(.page.tsx)|(.page.jsx)/i,
);

/**
 * lazy导出某一页面
 * @param props
 * @returns
 */
export const getAsyncImport = (props: { page: string }) => {
    const { page } = props;
    if (!has(pages, page)) throw new Error(`Page ${page} does not exists in 'views' dir!`);
    return lazy(() => timeout(pMinDelay(pages[page](), 5), 3000));
};

/**
 * 未登录情况下重定向回登录页，并且路径以redirect的参数给到登录页
 * @param param0
 * @returns
 */
export const AuthReDirect: FC<{ loginPath?: string }> = ({ loginPath }) => {
    const location = useLocation();
    let redirect = `?redirect=${location.pathname}`;
    if (location.search) redirect = `${redirect}${location.search}`;
    return <Navigate to={`${loginPath}${redirect}`} replace />;
};
