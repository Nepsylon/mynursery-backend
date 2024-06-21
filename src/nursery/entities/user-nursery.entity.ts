import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { Nursery } from './nursery.entity';

@Entity()
export class UserNursery extends MyNurseryBaseEntity {
    @OneToOne(() => User, (user) => user.userNursery)
    @JoinColumn()
    user: User;

    @OneToOne(() => Nursery, (nursery) => nursery.userNursery)
    @JoinColumn()
    nursery: Nursery;
}
