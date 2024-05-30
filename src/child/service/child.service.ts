import { Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Child } from '../entities/child.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { newChild } from '../interfaces/new-child.interface';
import { Token } from 'src/shared/interfaces/token.interface';
import { Role } from 'src/shared/enums/role.enum';

@Injectable()
export class ChildService extends MyNurseryBaseService<Child> {
    constructor(@InjectRepository(Child) private repo: Repository<Child>) {
        super(repo);
    }

    canCreate(dto: newChild, user?: Token): boolean {
        return true;
    }

    hasStandardAccess(user?: Token): boolean {
        return true;
    }

    hasSpecificAccess(user?: Token): boolean {
        this.errors = [];
        if (user.role !== Role.Admin || Role.User) {
            this.generateError("Vous n'avez pas les droits pour accéder à ce contenu.", 'child');
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
