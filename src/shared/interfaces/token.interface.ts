import { Role } from '../enums/role.enum';

export interface Token {
    id: string;
    //nursery: string;
    role: Role;
}
