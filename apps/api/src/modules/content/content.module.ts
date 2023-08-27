import { Module } from '@nestjs/common';

import * as controllerMaps from './controllers';
import { PostService, SanitizeService } from './services';
import { PostSubscriber } from './subscribers';
import { DatabaseModule } from '../database/database.module';
import { PostRepository } from './repositories';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities';

@Module({
    imports: [
        DatabaseModule.forRepository([PostRepository]),
        TypeOrmModule.forFeature([PostEntity]),
    ],
    controllers: Object.values(controllerMaps),
    providers: [PostService, SanitizeService, PostSubscriber],
    exports: [PostService, DatabaseModule.forRepository([PostRepository])],
})
export class ContentModule {}
