import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '../database/database.module';

import * as controllerMaps from './controllers';
import * as entityMaps from './entities';
import * as repoMaps from './repositories';
import * as serviceMaps from './services';

@Module({
    imports: [
        TypeOrmModule.forFeature(Object.values(entityMaps)),
        DatabaseModule.forRepository(Object.values(repoMaps)),
    ],
    controllers: Object.values(controllerMaps),
    providers: [...Object.values(serviceMaps)],
    exports: [...Object.values(serviceMaps), DatabaseModule.forRepository(Object.values(repoMaps))],
})
export class ContentModule {}
