import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Child } from '../entities/child.entity';
import { In, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createChildDto } from '../interfaces/create-child-dto';
import { Nursery } from 'src/nursery/entities/nursery.entity';
import { Parent } from 'src/parent/entities/parent.entity';
import { PaginatedItems } from 'src/shared/interfaces/paginatedItems.interface';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChildService extends MyNurseryBaseService<Child> {
    constructor(
        @InjectRepository(Child) private repo: Repository<Child>,
        @InjectRepository(Nursery) private nurseryRepository: Repository<Nursery>,
        @InjectRepository(Parent) private parentRepository: Repository<Parent>,
    ) {
        super(repo);
    }

    async eligibleCreateFormat(dto: createChildDto): Promise<boolean> {
        this.errors = [];
        return this.hasErrors();
    }

    async findOne(id: string | number): Promise<Child | HttpException> {
        this.errors = [];
        try {
            const foundOne = await this.repo.findOne({
                where: { id: +id, isDeleted: false },
                relations: ['parents', 'nursery'],
            });
            if (foundOne) {
                // Filtrer les parents supprimés (isDeleted: true)
                foundOne.parents = foundOne.parents.filter((parent) => !parent.isDeleted);
                return foundOne;
            } else {
                this.generateError(`Il n'existe pas d'élément avec cet identifiant.`, 'id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async update(id: string, dto: any): Promise<UpdateResult | HttpException> {
        this.errors = [];
        try {
            const foundOne = await this.repo.findOne({
                where: { id: +id, isDeleted: false },
                relations: ['parents', 'nursery'],
            });
            if (foundOne) {
                if (dto.parents) {
                    await this.setParentsToChild(+id, dto.parents);
                    delete dto.parents;
                }

                if (dto.nursery) {
                    await this.setNurseryToChild(+id, dto.nursery);
                    delete dto.nursery;
                }
                return await this.repo.update(id, dto);
            } else {
                this.generateError("Identifiant de l'enfant incorrect", 'wrong nursery id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async getPaginatedChildrenByOwnerId(ownerId: string, pageNumber: number, itemQuantity: number): Promise<PaginatedItems<Child>> {
        this.errors = [];
        try {
            const offset = pageNumber * itemQuantity;
            const [children, totalCount] = await this.repo
                .createQueryBuilder('child')
                .innerJoin('child.nursery', 'nursery')
                .where('nursery.ownerId = :ownerId', { ownerId })
                .skip(offset)
                .take(itemQuantity)
                .getManyAndCount();

            const totalPages = Math.ceil(totalCount / itemQuantity);
            const foundItems: PaginatedItems<Child> = {
                items: children,
                totalPages: totalPages,
                totalCount: totalCount,
            };

            return foundItems;
        } catch (err) {
            this.generateError(`Cet utilisateur n'est pas gérant`, 'not an owner');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    async getChildrenByEmployee(userId: string): Promise<Child[] | HttpException> {
        this.errors = [];
        try {
            const user = parseInt(userId, 10);
            const queryBuilder = this.repo
                .createQueryBuilder('child')
                .innerJoin('child.nursery', 'nursery')
                .innerJoin('nursery.employees', 'employee')
                .where('employee.id = :user', { user });

            return queryBuilder.getMany();
        } catch (err) {
            console.error(err); // Loguer les détails de l’erreur pour le débogage
            this.generateError(`Cet utilisateur n'est pas employé`, 'not an owner');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    async getPaginatedChildrenByUserId(userId: string, pageNumber: number, itemQuantity: number): Promise<PaginatedItems<Child>> {
        this.errors = [];
        try {
            const offset = pageNumber * itemQuantity;
            const queryBuilder = this.repo
                .createQueryBuilder('child')
                .innerJoin('child.nursery', 'nursery')
                .innerJoin('nursery.employees', 'employee')
                .where('employee.id = :userId', { userId })
                .skip(offset)
                .take(itemQuantity);

            const [children, totalCount] = await queryBuilder.getManyAndCount();
            const totalPages = Math.ceil(totalCount / itemQuantity);
            const foundItems: PaginatedItems<Child> = {
                items: children,
                totalPages: totalPages,
                totalCount: totalCount,
            };

            return foundItems;
        } catch (err) {
            console.error(err); // Loguer les détails de l’erreur pour le débogage
            this.generateError(`Cet utilisateur n'est pas employé`, 'not an owner');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    // async getChildrenByUser(userId: number): Promise<Child[]> {
    //     const user = await this.userRepo.findOne({
    //         where: { id: userId },
    //         relations: ['nursery', 'nursery.children'],
    //     });

    //     if (!user) {
    //         throw new Error('User not found');
    //     }

    //     // Collect all enfants from the user's creches
    //     const enfants = user.nurseries.flatMap((nurseries) => nurseries.children);
    //     return enfants;
    // }

    async setNurseryToChild(ChildId: number, nurseryId: number): Promise<Child | HttpException> {
        this.errors = [];
        try {
            const nursery = await this.nurseryRepository.findOneBy({ id: nurseryId });

            const child = await this.repo.findOneBy({ id: ChildId });

            // Si l'enfant n'existe pas
            if (!child) {
                this.generateError(`L'enfant n'existe pas.`, 'invalid child id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Si même crèche erreur
            if (child.nursery != null && child.nursery.id == nurseryId) {
                this.generateError(`La crèche est déjà attribuée`, `Can't reassign same nursery`);
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Si la crèche n'existe pas
            if (!nursery) {
                this.generateError(`La crèche n'existe pas.`, 'invalid nursery id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            child.nursery = nursery;
            return await this.repo.save(child);
        } catch (err) {
            throw err;
        }
    }

    async setParentsToChild(childId: number, parentIds: number[]): Promise<Child | HttpException> {
        this.errors = [];

        try {
            const child = await this.repo.findOne({ where: { id: childId }, relations: ['parents'] });

            // Si l'enfant n'existe pas
            if (!child) {
                this.generateError(`L'enfant n'existe pas.`, 'invalid child id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Obtention des parents par les ids
            const parents = await this.parentRepository.find({ where: { id: In(parentIds) } });

            // Si au moins un parent n'existe pas
            if (!parents) {
                this.generateError(`Vérifiez les identifiants envoyés`, 'at least one invalid parent id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Ajout des enfants dans le parent
            child.parents = parents;

            // Mise à jour de l'entité
            return this.repo.save(child);
        } catch (err) {
            this.generateError('Une erreur inconnue est survenue', 'set parents in child');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    async deleteParentsToChild(childId: number, parentIds: number[]): Promise<Child | HttpException> {
        this.errors = [];
        try {
            const child = await this.repo.findOne({ where: { id: childId }, relations: ['parents'] });

            // Si l'enfant n'existe pas
            if (!child) {
                this.generateError(`L'enfant n'existe pas.`, 'invalid child id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Obtention des parents par les ids
            const parentsToRemove = await this.parentRepository.find({ where: { id: In(parentIds) } });

            if (parentsToRemove.length !== parentIds.length) {
                throw new NotFoundException('One or more parents not found');
            }

            // On supprime les relations sur base du tableau d'ids
            child.parents = child.parents.filter((parent) => !parentIds.includes(parent.id));

            // Save the updated parent entity
            return this.repo.save(child);
        } catch (err) {
            this.generateError('Une erreur inconnue est survenue', 'delete children in parent');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }
}
