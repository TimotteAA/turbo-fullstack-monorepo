import { Module, ModuleMetadata } from '@nestjs/common';

import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';
import { addEntities } from '../database/helpers';
import { UserService } from '../user/services';
import { UserModule } from '../user/user.module';

import * as entityMaps from './entities';
import { ContentRbac } from './rbac';
import * as repoMaps from './repositories';
import * as serviceMaps from './services';
import { PostService } from './services/post.service';
import { SearchService } from './services/search.service';
import { ContentConfig } from './types';

@Module({})
export class ContentModule {
    static async forRoot(configure: Configure) {
        const config = await configure.get<ContentConfig>('content');

        const imports: ModuleMetadata['imports'] = [
            // TypeOrmModule.forFeature(Object.values(entityMaps)),
            addEntities(configure, [...Object.values(entityMaps)]),
            DatabaseModule.forRepository(Object.values(repoMaps)),
            UserModule,
        ];
        // const controllers: ModuleMetadata['controllers'] = Object.values(controllerMaps);

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
                    userService: UserService,
                ) {
                    return new PostService(
                        postRepo,
                        categoryRepo,
                        tagRepo,
                        searchSevice,
                        config.searchType,
                        userService,
                    );
                },
            },
            ContentRbac,
        ];
        const exports: ModuleMetadata['exports'] = [
            ...Object.values(serviceMaps),
            SearchService,
            PostService,
            DatabaseModule.forRepository(Object.values(repoMaps)),
        ];

        return {
            module: ContentModule,
            imports,
            // controllers,
            providers,
            exports,
        };
    }
}
