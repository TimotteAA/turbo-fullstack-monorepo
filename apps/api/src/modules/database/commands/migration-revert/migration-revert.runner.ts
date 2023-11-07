import { DataSource } from 'typeorm';

type TypeormMigrationRevertRunnerArgs = {
    dataSource: DataSource;
    transaction: string;
    fake?: boolean;
};

export class TypeormMigrationRevertRunner {
    async handler(args: TypeormMigrationRevertRunnerArgs) {
        // 抄自源码
        const options = {
            transaction:
                args.dataSource.options.migrationsTransactionMode ??
                ('all' as 'all' | 'none' | 'each'),
            fake: args.fake,
        };
        switch (args.transaction) {
            case 'all':
                options.transaction = 'all';
                break;
            case 'none':
            case 'false':
                options.transaction = 'none';
                break;
            case 'each':
                options.transaction = 'each';
                break;
            default:
            // noop
        }

        await args.dataSource.undoLastMigration(options);
    }
}
