import yargs from 'yargs';

import { App, CommandItem } from '../types';

import { StartComamndArgs } from './types';

export const createStartCommand: CommandItem<any, StartComamndArgs> = async (app: App) => ({
    command: ['start', 's'],
    describe: 'Start app（启动应用）',
    // 可选项
    builder: {
        watch: {
            type: 'boolean',
            default: false,
            description: 'Run app in watched mode.',
            alias: 'w',
        },
    },
    handler: async (args: yargs.Arguments<StartComamndArgs>) => {
        const { configure } = app;
        const appName = await configure.get<string>('app.name');
        const watching = args.watch ?? false;
        console.log(`Start app ${appName} in ${watching ? 'watching' : 'non-watching'} mode`);
    },
});
