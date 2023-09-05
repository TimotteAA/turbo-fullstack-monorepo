import { Module } from '@nestjs/common';

import * as controllerMaps from './controllers';
import { PostService, SanitizeService } from './services';
import { PostSubscriber } from './subscribers';
import { DatabaseModule } from '../database/database.module';
import * as repoMaps from './repositories';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity, CategoryEntity, CommentEntity, TagEntity } from './entities';

@Module({
    imports: [
        DatabaseModule.forRepository(Object.values(repoMaps)),
        TypeOrmModule.forFeature([PostEntity, CategoryEntity, CommentEntity, TagEntity]),
    ],
    controllers: Object.values(controllerMaps),
    providers: [PostService, SanitizeService, PostSubscriber],
    exports: [PostService, DatabaseModule.forRepository(Object.values(repoMaps))],
})
export class ContentModule {}
