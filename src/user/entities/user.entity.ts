import { Exclude } from 'class-transformer';
import { Nursery } from 'src/nursery/entities/nursery.entity';
import { UserNursery } from 'src/nursery/entities/user-nursery.entity';
import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { Language } from 'src/shared/enums/language.enums';
import { Role } from 'src/shared/enums/role.enum';
import { Column, Entity, JoinColumn, ManyToMany, OneToOne } from 'typeorm';

@Entity()
export class User extends MyNurseryBaseEntity {
    @Column({ length: 50 })
    surname: string;
    @Column({ length: 50 })
    name: string;
    @Column({ unique: true })
    email: string;
    @Column()
    @Exclude()
    password: string;
    @Column({ default: Role.User })
    role: Role;
    @Column({ default: false })
    isVerified: boolean;
    @Column({ default: 'Fr' })
    language: Language;

    @OneToOne(() => UserNursery, (userNursery) => userNursery.user, { nullable: true })
    @JoinColumn()
    userNursery: UserNursery;

    @ManyToMany(() => Nursery, (nursery) => nursery.employees, { nullable: true })
    workplaces: Nursery[];
}
