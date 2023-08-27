import { MockMethod } from 'vite-plugin-mock';

export interface MockItem extends MockMethod {
    res: any;
}
