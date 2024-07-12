import { Child } from 'src/child/entities/child.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class Nursery extends MyNurseryBaseEntity {
    @Column({ unique: true })
    name: string;
    @Column()
    location: string;
    @Column()
    total_children: number;

    // @OneToOne(() => UserNursery, (userNursery) => userNursery.nursery, { nullable: true })
    // @JoinColumn()
    // userNursery: UserNursery;

    @ManyToOne(() => User, (user) => user.nurseries, { eager: true, nullable: true })
    owner: User;

    @ManyToMany(() => User, (user) => user.workplaces, { nullable: true })
    @JoinTable()
    employees: User[];

    @OneToMany(() => Child, (child) => child.nursery, { eager: true, nullable: true, onDelete: 'SET NULL' })
    children: Child[];
}
