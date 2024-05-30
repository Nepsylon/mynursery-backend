import { Parent } from 'src/parent/entities/parent.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Child extends MyNurseryBaseEntity {
    @Column()
    surname: string;
    @Column()
    name: string;
    @Column()
    age: number;
    @Column()
    password: string;
    @Column()
    startDateContract: Date;
    @Column()
    endDateContract: Date;
    @ManyToOne(() => Parent, (parent) => parent.children)
    parent: Parent;
}
