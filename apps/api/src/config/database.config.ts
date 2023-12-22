import { ContentMock } from '@/database/mocks/content.mock';
import { UserMock } from '@/database/mocks/user.mock';
import ContentSeeder from '@/database/seeders/content.seeder';
import { UserSeeder } from '@/database/seeders/user.seeder';
import { createDbConfig } from '@/modules/database/helpers';

export const database = createDbConfig((_configure) => ({
    common: {
        // synchronize: true,
    },
    connections: [
        {
            // 以下为mysql配置
            type: 'mysql',
            host: 'localhost',
            port: 3308,
            username: 'root',
            password: 'root',
            database: 'timotte',
            seeders: [UserSeeder, ContentSeeder],
            mockMaps: [UserMock, ContentMock],
        },
    ],
}));
