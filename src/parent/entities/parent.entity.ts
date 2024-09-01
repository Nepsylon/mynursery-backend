import { Child } from 'src/child/entities/child.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Parent extends MyNurseryBaseEntity {
    @Column()
    surname: string;
    @Column()
    name: string;
    @Column()
    email: string;
    @Column()
    phone: string;

    @ManyToMany(() => Child, (child) => child.parents, { eager: true, onDelete: 'CASCADE' })
    @JoinTable()
    children: Child[];
}
