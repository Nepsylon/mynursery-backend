import { Child } from 'src/child/entities/child.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { UserNursery } from './user-nursery.entity';

@Entity()
export class Nursery extends MyNurseryBaseEntity {
    @Column({ unique: true })
    name: string;
    @Column()
    location: string;
    @Column()
    total_children: number;

    @OneToOne(() => UserNursery, (userNursery) => userNursery.nursery, { nullable: true })
    @JoinColumn()
    userNursery: UserNursery;

    @ManyToMany(() => User, (user) => user.workplaces, { nullable: true })
    @JoinTable()
    employees: User[];

    @OneToMany(() => Child, (child) => child.nursery, { eager: true, nullable: true, onDelete: 'SET NULL' })
    children: Child[];
}
