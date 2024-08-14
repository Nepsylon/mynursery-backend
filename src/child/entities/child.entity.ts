import { Nursery } from 'src/nursery/entities/nursery.entity';
import { Parent } from 'src/parent/entities/parent.entity';
import { Activity } from 'src/activity/entities/activity.entity';
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
    @Column({ nullable: true })
    gender: string;
    @Column()
    startDateContract: Date;
    @Column()
    endDateContract: Date;
    @Column({ default: 0 })
    absence: number;
    @ManyToMany(() => Parent, (parent) => parent.children)
    parents: Parent[];

    @ManyToOne(() => Nursery, (nursery) => nursery.children, { onDelete: 'CASCADE' })
    nursery: Nursery;

    @ManyToOne(() => Activity, (activity) => activity.children, { onDelete: 'CASCADE' })
    activity: Activity;
}
