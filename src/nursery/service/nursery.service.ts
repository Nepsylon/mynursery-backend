import { Inject, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Nursery } from '../entities/nursery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newNursery } from '../interface/new-nursery.interface';
import { Token } from 'src/shared/interfaces/token.interface';
import { Role } from 'src/shared/enums/role.enum';

@Injectable()
export class NurseryService extends MyNurseryBaseService<Nursery> {
    constructor(@InjectRepository(Nursery) private repo: Repository<Nursery>) {
        super(repo);
    }

    canCreate(dto: newNursery, user?: Token): boolean {
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
