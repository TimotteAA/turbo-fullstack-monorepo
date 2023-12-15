import { Injectable } from '@nestjs/common';

import { BaseService } from '@/modules/database/base';

import { ResourceRepository } from '../repositories';

import { ResourceEntity } from '../entities/resource.entity';

@Injectable()
export class ResourceService extends BaseService<ResourceEntity, ResourceRepository> {
    constructor(private repo: ResourceRepository) {
        super(repo);
    }

    async findTrees() {
        // return this.entityToDomain(tree);
        return this.repo.findTrees();
    }
}
