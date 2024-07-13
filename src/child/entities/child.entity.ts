import { Nursery } from 'src/nursery/entities/nursery.entity';
import { Parent } from 'src/parent/entities/parent.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';

@Entity()
export class Child extends MyNurseryBaseEntity {
    @Column()
    surname: string;
    @Column()
    name: string;
    @Column()
    age: number;
    @Column()
    startDateContract: Date;
    @Column()
    endDateContract: Date;

    @ManyToMany(() => Parent, (parent) => parent.children)
    parents: Parent[];

    @ManyToOne(() => Nursery, (nursery) => nursery.children, { onDelete: 'CASCADE' })
    nursery: Nursery;
}
