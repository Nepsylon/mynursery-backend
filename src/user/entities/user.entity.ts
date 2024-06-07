import { MyNurseryBaseEntity } from 'src/shared/entities/base.entity';
import { Language } from 'src/shared/enums/language.enums';
import { Role } from 'src/shared/enums/role.enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends MyNurseryBaseEntity {
    @Column({ length: 50 })
    surname: string;
    @Column({ length: 50 })
    name: string;
    @Column({ unique: true })
    email: string;
    @Column()
    password: string;
    @Column({ default: Role.User })
    role: Role;
    @Column({ default: false })
    isVerified: boolean;
    @Column({ default: 'Fr' })
    language: Language;
}
