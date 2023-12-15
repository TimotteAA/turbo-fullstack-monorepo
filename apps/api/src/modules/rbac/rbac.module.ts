import { Module, ModuleMetadata } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';
import { addEntities } from '../database/helpers';

import * as entityMaps from './entities';
import { RbacResolver } from './rbac.resolver';
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

        const providers: ModuleMetadata['providers'] = [
            ...Object.values(serviceMaps),
            {
                provide: RbacResolver,
                useFactory: async (dataSource: DataSource) => {
                    const resolver = new RbacResolver(dataSource, configure);
                    resolver.setOptions({});
                    return resolver;
                },
                inject: [getDataSourceToken()],
            },
        ];
        const exports: ModuleMetadata['exports'] = [
            ...Object.values(serviceMaps),
            DatabaseModule.forRepository(Object.values(repoMaps)),
            RbacResolver,
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
