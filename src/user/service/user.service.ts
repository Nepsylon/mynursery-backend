import { Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newUser } from '../interfaces/new-user.interface';
import { Role } from 'src/shared/enums/role.enum';

@Injectable()
export class UserService extends MyNurseryBaseService<User> {
    constructor(@InjectRepository(User) private repo: Repository<User>) {
        super(repo);
    }

    canCreate(dto: newUser, user?: Token): boolean {
        return true;
    }

    hasStandardAccess(user?: Token): boolean {
        return true;
    }

    hasSpecificAccess(user?: Token): boolean {
        this.errors = [];
        if (user.role !== Role.Admin) {
            this.generateError("Vous n'avez pas les droits pour accéder à ce contenu.", 'user');
        }
        return this.hasError();
    }

    canUpdate(user?: Token): boolean {
        return true;
    }

    canDelete(user?: Token): boolean {
        return true;
    }
}
