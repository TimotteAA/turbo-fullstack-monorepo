import yargs from 'yargs';

import { App, CommandItem } from '../types';

import { getCLIConfig } from './helpers/config';
import { start, startPM2 } from './helpers/starter';
import { StartCommandArguments } from './types';

export const createStartCommand: CommandItem<any, StartCommandArguments> = async (app: App) => ({
    command: ['start', 's'],
    describe: 'Start app',
    // 可选参数
    builder: {
        nestConfig: {
            type: 'string',
            alias: 'n',
            describe: 'The path of nestjs cli config',
            default: 'nest-cli.json',
        },
        tsConfig: {
            type: 'string',
            alias: 't',
            describe: 'The path of tsconfig.build.json',
            default: 'tsconfig.build.json',
        },
        entry: {
            type: 'string',
            alias: 'e',
            describe:
                'Specify entry file for ts runner, you can specify js entry file in nest-cli.json by entryFile.',
            default: 'main.ts',
        },
        prod: {
            type: 'boolean',
            alias: 'p',
            describe: 'Run app in production by pm2.',
            default: false,
        },
        restart: {
            type: 'boolean',
            alias: 'r',
            describe: 'Restart app(only pm2), pm2 will auto run start if process not exists.',
            default: false,
        },
        typescript: {
            type: 'boolean',
            alias: 'ts',
            describe: 'Directly run ts files',
            default: true,
        },
        watch: {
            type: 'boolean',
            default: false,
            description: 'Run app in watch mode.',
            alias: 'w',
        },
        debug: {
            type: 'boolean',
            alias: 'd',
            describe: 'Whether to enbale for debug mode, only valid for development mode',
            default: false,
        },
    },
    handler: async (args: yargs.Arguments<StartCommandArguments>) => {
        const { configure } = app;
        const config = getCLIConfig(args.tsConfig, args.nestConfig, args.entry);
        if (args.prod || args.restart) {
            await startPM2(configure, args, config);
            // console.log('args ', args, configure);
        } else await start(args, config);
    },
});
