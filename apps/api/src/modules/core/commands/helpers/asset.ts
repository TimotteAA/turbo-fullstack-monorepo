import { join } from 'path';

import { ActionOnFile, AssetEntry } from '@nestjs/cli/lib/configuration';
import chokidar from 'chokidar';
import { get } from 'lodash';

import { CLIConfig } from '../types';

import { toBoolean } from '../../utils';

export class Asset {
    /** 正在监听的文件 */
    private watchAssetsKeyValue: { [key: string]: boolean } = {};

    private watchers: chokidar.FSWatcher[] = [];

    // 是否在监听中
    private actionInProgress = false;

    closeWatchers() {
        const timeoutMs = 500;
        const closeFn = () => {
            if (this.actionInProgress) {
                this.actionInProgress = false;
                setTimeout(closeFn, timeoutMs);
            } else {
                this.watchers.forEach((watcher) => watcher.close());
            }
        };

        setTimeout(closeFn, timeoutMs);
    }

    /**
     * 监听nestjs assets，如果有变动，重启应用
     * @param config
     * @param codePath
     * @param changer
     */
    watchAssets(config: CLIConfig, codePath: string, changer: () => void) {
        // nest一些assets，比如邮件模版
        const assets = get(config.options.nest, 'compilerOptions.assets', []) as AssetEntry[];
        if (assets.length <= 0) {
            return;
        }
        try {
            const isWatchEnabled = toBoolean(get(config, 'watchAssets', 'src'));
            const filesToWatch = assets.map<AssetEntry>((item) => {
                if (typeof item === 'string') {
                    return {
                        glob: join(codePath, item),
                    };
                }
                return {
                    glob: join(codePath, item.include!),
                    exclude: item.exclude ? join(codePath, item.exclude) : undefined,
                    flat: item.flat,
                    watchAssets: item.watchAssets,
                };
            });

            for (const item of filesToWatch) {
                const option: ActionOnFile = {
                    action: 'change',
                    item,
                    path: '',
                    sourceRoot: codePath,
                    watchAssetsMode: isWatchEnabled,
                };

                const watcher = chokidar
                    .watch(item.glob, { ignored: item.exclude })
                    .on('add', (path: string) => {
                        this.actionOnFile({ ...option, path, action: 'change' }, changer);
                    })
                    .on('change', (path: string) => {
                        console.log('change ', path);
                        this.actionOnFile({ ...option, path, action: 'change' }, changer);
                    })
                    .on('unlink', (path: string) => {
                        this.actionOnFile({ ...option, path, action: 'unlink' }, changer);
                        console.log('remove ', path);
                    });

                this.watchers.push(watcher);
            }
        } catch (err) {
            throw new Error(
                `An error occurred during the assets copying process. ${(err as any).message}`,
            );
        }
    }

    protected actionOnFile(option: ActionOnFile, change: () => void) {
        const { action, item, path, watchAssetsMode } = option;
        const isWatchEnabled = watchAssetsMode || item.watchAssets;

        // 不监听assets或者已经监听
        if (!isWatchEnabled && this.watchAssetsKeyValue[path]) {
            return;
        }
        //
        this.watchAssetsKeyValue[path] = true;
        this.actionInProgress = true;
        if (action === 'change') change();
    }
}
