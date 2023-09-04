import { Expose } from 'class-transformer';
import { PrimaryColumn, BaseEntity as TypeormBaseEntity } from 'typeorm';

/**
 * 对同一封装id
 *
 */
export class BaseEntity extends TypeormBaseEntity {
    @Expose()
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;
}
