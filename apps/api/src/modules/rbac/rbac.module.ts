import { Module, ModuleMetadata } from '@nestjs/common';

import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';
import { addEntities } from '../database/helpers';

import * as entityMaps from './entities';
import * as repoMaps from './repositories';
import * as serviceMaps from './services';

@Module({})
export class RbacModule {
    static async forRoot(configure: Configure) {
        const imports: ModuleMetadata['imports'] = [
            // TypeOrmModule.forFeature(Object.values(entityMaps)),
            addEntities(configure, [...Object.values(entityMaps)]),
            DatabaseModule.forRepository(Object.values(repoMaps)),
        ];
        // const controllers: ModuleMetadata['controllers'] = Object.values(controllerMaps);

        const providers: ModuleMetadata['providers'] = [...Object.values(serviceMaps)];
        const exports: ModuleMetadata['exports'] = [
            ...Object.values(serviceMaps),
            DatabaseModule.forRepository(Object.values(repoMaps)),
        ];

        return {
            module: RbacModule,
            imports,
            // controllers,
            providers,
            exports,
        };
    }
}
