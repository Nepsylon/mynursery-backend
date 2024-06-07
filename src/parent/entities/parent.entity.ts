import { Child } from 'src/child/entities/child.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Parent extends MyNurseryBaseEntity {
    @Column()
    surname: string;
    @Column()
    name: string;
    @Column()
    email: string;
    @OneToMany(() => Child, (child) => child.parent)
    children: Child[];
}