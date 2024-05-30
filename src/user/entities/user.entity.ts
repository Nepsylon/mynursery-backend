import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { Language } from 'src/shared/enums/language.enums';
import { Role } from 'src/shared/enums/role.enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends MyNurseryBaseEntity {
    @Column()
    surname: string;
    @Column()
    name: string;
    @Column()
    email: string;
    @Column()
    password: string;
    @Column()
    role: Role;
    @Column({ default: false })
    isVerified: boolean;
    @Column({ default: 'Fr' })
    language: Language;
}
