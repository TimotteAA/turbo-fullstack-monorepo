import { ModuleMetadata } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';

import * as controllerMaps from './controllers';
import * as entityMaps from './entities';
import * as repoMaps from './repositories';
import * as serviceMaps from './services';
import { PostService } from './services/post.service';
import { SearchService } from './services/search.service';
import { ContentConfig } from './types';

export class ContentModule {
    static async forRoot(configure: Configure) {
        const config = await configure.get<ContentConfig>('content');

        const imports: ModuleMetadata['imports'] = [
            TypeOrmModule.forFeature(Object.values(entityMaps)),
            DatabaseModule.forRepository(Object.values(repoMaps)),
        ];
        const controllers: ModuleMetadata['controllers'] = Object.values(controllerMaps);

        const providers: ModuleMetadata['providers'] = [
            ...Object.values(serviceMaps),
            {
                provide: PostService,
                inject: [
                    repoMaps.PostRepository,
                    repoMaps.CategoryRepository,
                    repoMaps.TagRepository,
                    SearchService,
                ],
                useFactory(
                    postRepo: repoMaps.PostRepository,
                    categoryRepo: repoMaps.CategoryRepository,
                    tagRepo: repoMaps.TagRepository,
                    searchSevice: SearchService,
                ) {
                    return new PostService(
                        postRepo,
                        categoryRepo,
                        tagRepo,
                        searchSevice,
                        config.searchType,
                    );
                },
            },
        ];
        const exports: ModuleMetadata['exports'] = [
            ...Object.values(serviceMaps),
            SearchService,
            DatabaseModule.forRepository(Object.values(repoMaps)),
        ];

        return {
            module: ContentModule,
            imports,
            controllers,
            providers,
            exports,
        };
    }
}
