import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { PostEntity } from '../entities';
import { SanitizeService } from '../services';

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<PostEntity> {
    constructor(
        dataSource: DataSource,
        protected sanitizeService: SanitizeService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo(): string | Function {
        return PostEntity;
    }

    beforeInsert(event: InsertEvent<PostEntity>): void | Promise<any> {
        if (event.entity.type === 'html') {
            event.entity.body = this.sanitizeService.sanitize(event.entity.body);
        }
    }
}
