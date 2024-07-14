import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { newParent } from '../interface/new-parent.interface';
import { Child } from 'src/child/entities/child.entity';

@Injectable()
export class ParentService extends MyNurseryBaseService<Parent> {
    constructor(
        @InjectRepository(Parent) private repo: Repository<Parent>,
        @InjectRepository(Child) private childRepo: Repository<Child>,
    ) {
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

    async setChildToParent(parentId: number, NewchildId: number): Promise<Parent | HttpException> {
        this.errors = [];

        const child = await this.childRepo.findOne({ where: { id: NewchildId }, relations: ['parents'] });

        const parent = await this.repo.findOneBy({ id: parentId });

        // Si le parent n'existe pas
        if (!parent) {
            this.generateError(`Le parent n'existe pas.`, 'invalid child id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        // Si l'enfant est déjà attribué
        if (parent.children != null && parent.children.some((elem) => elem.id === NewchildId)) {
            this.generateError(`L'enfant est déjà attribué`, `Can't reassign same parent`);
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        // Si l'enfant n'existe pas
        if (!child) {
            this.generateError(`L'enfant n'existe pas`, 'invalid child id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        parent.children.push(child);
        await this.repo.save(parent);
        return await this.repo.findOneBy({ id: parentId });
    }
}
