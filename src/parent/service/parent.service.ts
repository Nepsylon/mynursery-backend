import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { Role } from 'src/shared/enums/role.enum';
import { Token } from 'src/shared/interfaces/token.interface';
import { newParent } from '../interface/new-parent.interface';

@Injectable()
export class ParentService extends MyNurseryBaseService<Parent> {
    constructor(@InjectRepository(Parent) private repo: Repository<Parent>) {
        super(repo);
    }

    canCreate(dto: newParent, user?: Token): boolean {
        return true;
    }

    hasStandardAccess(user?: Token): boolean {
        return true;
    }

    hasSpecificAccess(user?: Token): boolean {
        this.errors = [];
        if (user.role !== Role.Admin || Role.User) {
            this.generateError("Vous n'avez pas les droits pour accéder à ce contenu.", 'parent');
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
