import chalk from 'chalk';
import { isNil } from 'lodash';
import yargs, { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { App, CommandCollection } from '../types';

/**
 * 创建cli命令集合
 * @param factory cli命令集合
 * @param app
 */
export const createCommands = async (factory: () => CommandCollection, app: Required<App>) => {
    // 所有的命令集合
    const collection: CommandCollection = [...factory()];
    // 构建yargs命令项
    const commands = await Promise.all(collection.map(async (command) => command(app)));
    return commands.map((command) => ({
        ...command,
        // 覆盖原始的handler
        handler: async (args: Arguments) => {
            await app.container.close();
            await command.handler(args);
            // 关闭瞬时应用
            if (command.instant) process.exit();
        },
    }));
};

export const createCLI = async (creator: () => Promise<App>) => {
    const app = await creator();
    // 从文档里抄来的
    const bin = yargs(hideBin(process.argv));
    // 注册命令
    app.commands.forEach((comamnd) => bin.command(comamnd));
    bin.usage('Usage: $0 <command> [options]')
        .scriptName('cli')
        .demandCommand(1, '')
        .fail(async (msg, err, _args) => {
            if (!msg && !err) {
                bin.showHelp();
                process.exit();
            }
            // const { default: chalk } = await import('chalk');
            if (!isNil(msg)) console.error(chalk.red(msg));
            if (!isNil(err)) console.error(chalk.red(err));
        })
        .strict()
        .alias('v', 'version')
        .help('help')
        .alias('h', 'help')
        .parse();
};
