import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { Token } from 'src/shared/interfaces/token.interface';
import { newParent } from '../interface/new-parent.interface';

@Injectable()
export class ParentService extends MyNurseryBaseService<Parent> {
    constructor(@InjectRepository(Parent) private repo: Repository<Parent>) {
        super(repo);
    }

    async eligibleCreateFormat(dto: newParent): Promise<boolean> {
        this.errors = [];
        const emailRegex = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');

        if (!emailRegex.test(dto.email)) {
            this.generateError(`Veuillez entrer un format correct d'adresse email`, 'email');
        }
        return this.hasErrors();
    }
}
