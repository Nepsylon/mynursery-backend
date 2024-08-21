import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { In, Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { newParent } from '../interface/new-parent.interface';
import { Child } from 'src/child/entities/child.entity';

@Injectable()
export class ParentService extends MyNurseryBaseService<Parent> {
    constructor(
        @InjectRepository(Parent) private repo: Repository<Parent>,
        @InjectRepository(Child) private childRepository: Repository<Child>,
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

    async findOne(id: string | number): Promise<Parent | HttpException> {
        this.errors = [];
        try {
            const foundOne = await this.repo.findOne({
                where: { id: +id, isDeleted: false },
                relations: ['children'],
            });
            if (foundOne) {
                return foundOne;
            } else {
                this.generateError(`Il n'existe pas d'élément avec cet identifiant.`, 'id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async setChildrenToParent(parentId: number, childIds: number[]): Promise<Parent | HttpException> {
        this.errors = [];

        try {
            const parent = await this.repo.findOne({ where: { id: parentId }, relations: ['children'] });

            // Si le parent n'existe pas
            if (!parent) {
                this.generateError(`Le parent n'existe pas.`, 'invalid parent id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Obtention des enfants par les ids
            const children = await this.childRepository.find({ where: { id: In(childIds) } });

            // Si au moins un enfant n'existe pas
            if (!children) {
                this.generateError(`Vérifiez les identifiants envoyés`, 'at least one invalid child id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Ajout des enfants dans le parent
            parent.children = children;

            // Mise à jour de l'entité
            return this.repo.save(parent);
        } catch (err) {
            this.generateError('Une erreur inconnue est survenue', 'set children in parent');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    async deleteChildrenForParent(parentId: number, childIds: number[]): Promise<Parent | HttpException> {
        this.errors = [];
        try {
            const parent = await this.repo.findOne({
                where: { id: parentId },
                relations: ['children'],
            });

            // Si le parent n'existe pas
            if (!parent) {
                throw new NotFoundException('Parent not found');
            }

            // Obtention des enfants par les ids
            const childrenToRemove = await this.childRepository.find({ where: { id: In(childIds) } });

            if (childrenToRemove.length !== childIds.length) {
                throw new NotFoundException('One or more children not found');
            }

            // On supprime les relations sur base du tableau d'ids
            parent.children = parent.children.filter((child) => !childIds.includes(child.id));

            // Save the updated parent entity
            return this.repo.save(parent);
        } catch (err) {
            this.generateError('Une erreur inconnue est survenue', 'delete children in parent');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }
}
