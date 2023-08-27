import { Module } from '@nestjs/common';
import { CoreModule } from './modules/core/core.module';
import { DatabaseModule } from './modules/database/database.module';

import { config as dbConfig } from './config';
import { ContentModule } from './modules/content/content.module';

@Module({
    imports: [CoreModule.forRoot(), DatabaseModule.forRoot(dbConfig), ContentModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
