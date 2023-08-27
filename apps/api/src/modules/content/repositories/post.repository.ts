import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';
import { PostEntity } from '../entities';
import { Repository } from 'typeorm';

// 传入entity，在Database.forRepo时注册
@CUSTOM_REPOSITORY(PostEntity)
export class PostRepository extends Repository<PostEntity> {
    buildBaseQB() {
        return this.createQueryBuilder('post');
    }
}
