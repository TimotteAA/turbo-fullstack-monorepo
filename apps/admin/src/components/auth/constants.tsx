import { createContext } from 'react';

import { IAuth } from './types';

export const AuthContext = createContext<IAuth | null>(null);
