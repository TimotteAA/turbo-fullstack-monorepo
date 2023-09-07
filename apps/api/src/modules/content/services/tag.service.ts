import { omit } from 'lodash';
import { CreateTagDto, QueryTagDto, UpdateTagDto } from '../dtos';
import { TagRepository } from '../repositories';
import { paginate } from '@/modules/database/helpers';

export class TagService {
    constructor(protected repo: TagRepository) {}

    async create(data: CreateTagDto) {
        await this.repo.save(data);
    }

    async detail(id: string) {
        let qb = this.repo.buildBaseQB();
        qb = qb.andWhere('tag.id = :id', { id: id });
        const tag = await qb.getOne();
        return tag;
    }

    async update(data: UpdateTagDto) {
        await this.repo.update(data.id, omit(data, ['id']));
        return this.detail(data.id);
    }

    async paginate(options: QueryTagDto) {
        const qb = this.buildListQuery(options);
        return paginate(qb, options);
    }

    async delete(id: string) {
        const item = await this.repo.findOneByOrFail({ id });
        return item;
    }

    protected buildListQuery(options: QueryTagDto) {
        let qb = this.repo.buildBaseQB();
        return qb;
    }
}
