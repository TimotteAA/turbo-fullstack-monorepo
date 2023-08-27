/// <reference types="vite/client" />
import path from 'node:path';

import react from '@vitejs/plugin-react-swc';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';

// https://vitejs.dev/config/
export default ({ mode }) => {
    return defineConfig({
        plugins: [
            react(),
            Icons({ compiler: 'jsx', jsx: 'react' }),
            viteMockServe({
                mockPath: 'mock',
                enable: mode === 'dev',
                ignore: /^_/,
            }),
        ],
        resolve: {
            alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
        },
    });
};
