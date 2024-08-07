import { Child } from 'src/child/entities/child.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, ManyToMany, OneToMany, JoinTable } from 'typeorm';

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
