import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const config: () => TypeOrmModuleOptions = () => {
    return {
        // 前期直接从entity同步表结构
        synchronize: true,
        autoLoadEntities: true,
        charset: 'utf8mb4',
        logging: ['error'],
        type: 'mysql',
        host: 'localhost',
        port: 3307,
        username: 'root',
        password: 'root',
        database: 'timotte',
        // type: 'better-sqlite3',
        // database: resolve(__dirname, '../../database.db'),
        // synchronize: true,
        // autoLoadEntities: true,
    };
};
