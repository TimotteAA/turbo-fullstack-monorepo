import { omit } from 'lodash';

import { paginate } from '@/modules/database/helpers';

import { CreateTagDto, QueryTagDto, UpdateTagDto } from '../dtos';
import { TagRepository } from '../repositories';

export class TagService {
    constructor(protected repo: TagRepository) {
        console.log('tagRepo ', repo);
    }

    async create(data: CreateTagDto) {
        const res = await this.repo.save(data);
        return this.detail(res.id);
    }

    async detail(id: string) {
        let qb = this.repo.buildBaseQB();
        qb = qb.andWhere('tag.id = :id', { id });
        const tag = await qb.getOne();
        return tag;
    }

    async update(data: UpdateTagDto) {
        await this.repo.update(data.id, omit(data, ['id']));
        return this.detail(data.id);
    }

    async paginate(options: QueryTagDto) {
        const qb = this.repo.buildBaseQB();
        return paginate(qb, options);
    }

    async delete(id: string) {
        const item = await this.repo.findOneByOrFail({ id });
        return item;
    }
}
