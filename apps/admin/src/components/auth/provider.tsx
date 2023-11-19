import { isNil } from 'lodash';
import { ReactNode, useEffect, useRef, useState } from 'react';

import { config } from '@/config';

import { useFetcher } from '../fetcher/hooks';
import { FetcherStore } from '../fetcher/store';

import { AuthContext } from './constants';
import { IAuth } from './types';

/**
 * 保存用户信息的组件
 *
 * @param param0
 * @returns
 */
const Auth: FC<{ children?: ReactNode }> = ({ children }) => {
    const token = FetcherStore((state) => state.token);
    const fetcher = useFetcher();
    const [auth, setAuth] = useState<IAuth | null>(null);
    // 未登录配置
    const { api, error } = config().auth ?? {};
    const requested = useRef(false);
    useEffect(() => {
        const getInfo = async () => {
            if (isNil(token) || isNil(api)) {
                setAuth(null);
            } else {
                try {
                    const { data } = await fetcher.get(api);
                    setAuth(data);
                    // setAuth({ token: 'test', username: 'test', permissions: ['asda'] });
                } catch (err) {
                    setAuth(null);
                    // setAuth({ token: 'test', username: 'test', permissions: ['asda'] });
                    !isNil(error) ? error() : console.log(err);
                }
            }
        };
        // if (requested.current) getInfo();
        getInfo();

        return () => {
            requested.current = true;
        };
    }, [token, api, error]);

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default Auth;
