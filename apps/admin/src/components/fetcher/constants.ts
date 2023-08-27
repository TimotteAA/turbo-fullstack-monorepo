import axios, { AxiosInstance } from 'axios';
import { createContext } from 'react';

/**
 * 共享axios实例
 */
export const FetcherContext = createContext<AxiosInstance>(axios.create());
