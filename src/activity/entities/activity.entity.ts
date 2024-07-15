import { Child } from 'src/child/entities/child.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { categorie } from 'src/shared/enums/categorie.enum';

@Entity()
export class Activity extends MyNurseryBaseEntity {
    @Column({ length: 50 })
    title: string;
    @Column()
    startDate: Date;
    @Column()
    endDate: Date;
    @Column()
    categorie: categorie;

    @OneToMany(() => Child, (child) => child.activity, { eager: true, nullable: true, onDelete: 'CASCADE' })
    children: Child[];
}
