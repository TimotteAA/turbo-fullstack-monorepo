import { IAuth } from '@/components/auth/types';

import type { RequestParams } from './_utils';
import { resultError, getRequestToken } from './_utils';
import { MockItem } from './types';

export function createFakeUserList(): IAuth[] {
    return [
        {
            id: '1',
            username: 'timotte',
            email: 'xxx@xxx.com',
            avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq3mhHvdmoKIYmmw2xsKo924Gu2MZobI0KIjjdFPN9&s',
            desc: '你爹',
            password: '123456',
            token: 'fuckyou',
            homePath: '/dashboard/analysis',
            permissions: ['aaa'],
        },
        {
            id: '2',
            username: 'xxxYYY',
            email: 'xxx@xxx.com',
            avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq3mhHvdmoKIYmmw2xsKo924Gu2MZobI0KIjjdFPN9&s',
            desc: 'your father',
            password: '123456',
            token: 'fuckyou',
            homePath: '/dashboard/workbench',
            permissions: ['aaa'],
        },
    ];
}

// mock function
export default [
    {
        url: '/api/user/auth/login',
        timeout: 200,
        method: 'post',
        response({ body }: { body: any }) {
            console.log('mcok cmock');
            const { credential, password } = body;
            const checkUser = createFakeUserList().find(
                (item) =>
                    (item.username === credential || item.email === credential) &&
                    password === item.password,
            );
            if (!checkUser) {
                this.res.statusCode = 401;
                return resultError('用户名或者密码错误');
            }

            const { token } = checkUser;
            return { token };
        },
    },
    {
        url: '/api/user/info',
        method: 'get',
        response(request: RequestParams) {
            const token = getRequestToken(request);
            if (!token) return resultError('token错误');
            const checkUser = createFakeUserList().find((item) => item.token === token);
            if (!checkUser) return resultError('用户不存在！');
            return checkUser;
        },
    },
] as MockItem[];
