import { Child } from 'src/child/entities/child.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Nursery extends MyNurseryBaseEntity {
    @Column()
    name: string;
    @Column()
    location: string;
    @Column()
    total_children: number;

    //Add a logo by default with the url
    @Column({ nullable: true })
    logo: string;

    @ManyToOne(() => User, (user) => user.nurseries, { nullable: true })
    owner: User;

    @ManyToMany(() => User, (user) => user.workplaces, { nullable: true })
    @JoinTable()
    employees: User[];

    @OneToMany(() => Child, (child) => child.nursery, { nullable: true, onDelete: 'CASCADE' })
    children: Child[];
}
