import { Language } from 'src/shared/enums/language.enums';
import { Role } from 'src/shared/enums/role.enum';

export interface newUserDto {
    surname: string;
    name: string;
    email: string;
    password: string;
    role?: Role;
    //isVerified: boolean;
    //language: Language;
}
