import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';

import { BaseService } from '@/modules/database/base/base.service';

import { CreateTagDto, UpdateTagDto } from '../dtos';
import { TagEntity } from '../entities';
import { TagRepository } from '../repositories';

@Injectable()
export class TagService extends BaseService<TagEntity, TagRepository> {
    constructor(protected repo: TagRepository) {
        super(repo);
    }

    async create(data: CreateTagDto) {
        const res = await this.repo.save(data);
        return this.detail(res.id);
    }

    async update(data: UpdateTagDto) {
        await this.repo.update(data.id, omit(data, ['id']));
        return this.detail(data.id);
    }
}
