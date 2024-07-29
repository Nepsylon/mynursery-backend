import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Nursery } from '../entities/nursery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createNurseryDto } from '../interface/create-nursery-dto';
import { User } from 'src/user/entities/user.entity';
import { Child } from 'src/child/entities/child.entity';

@Injectable()
export class NurseryService extends MyNurseryBaseService<Nursery> {
    constructor(
        @InjectRepository(Nursery) private repo: Repository<Nursery>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Child) private childRepo: Repository<Child>,
    ) {
        super(repo);
    }

    /**
     * Méthode qui vérifie les champs obligatoires (facultative)
     * @param dto Interface attendu pour créer une entité Nursery
     * @returns Une valeur booléenne selon la validité des champs
     */
    async eligibleCreateFormat(dto: createNurseryDto): Promise<boolean> {
        this.errors = [];

        const isNameUnique = await this.verifyUnicity('name', dto.name);
        if (!isNameUnique) {
            this.generateError(`Le nom de la crèche est déjà pris`, 'nursery name');
        }
        return this.hasErrors();
    }

    /**
     * La fonction de création d'une nursery
     * @param dto L'objet en attente
     * @param user Le jeton d'accès optionnel de l'utilisateur connecté
     * @returns Le résultat de l'objet ajouté ou une erreur
     */
    async create(dto: createNurseryDto, logo?: Express.Multer.File): Promise<Nursery | HttpException> {
        this.errors = [];
        try {
            if (await this.eligibleCreateFormat(dto)) {
                if (logo) {
                    const url_logo = await this.uploadFile(logo, 'logos');
                    dto.logo = url_logo;
                }
                return await this.repo.save(dto);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async setOwnerNursery(nurseryId: number, newOwnerId: number): Promise<Nursery | HttpException> {
        this.errors = [];

        const nursery = await this.repo.findOneBy({ id: nurseryId });

        // Si la crèche n'existe pas
        if (!nursery) {
            this.generateError(`La crèche n'existe pas.`, 'invalid nursery id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        // Si même gérant alors erreur
        if (nursery.owner != null && nursery.owner.id == newOwnerId) {
            this.generateError(`L'utilisateur est déjà gérant de la crèche`, `Can't reassign same owner`);
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
        const user = await this.userRepo.findOneBy({ id: newOwnerId });

        // Si le nouveau gérant n'existe pas => erreur
        if (!user) {
            this.generateError(`L'utilisateur n'existe pas.`, 'invalid user id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        nursery.owner = user;
        return await this.repo.save(nursery);
    }

    async getOwnerNursery(nurseryId: number): Promise<User | HttpException> {
        try {
            const ownerNursery = await this.repo.findOne({ where: { id: nurseryId }, relations: ['owner'] });
            if (ownerNursery) {
                return ownerNursery.owner;
            } else {
                this.generateError(`La crèche spécifiée n'a pas de propriétaire ou n'existe pas.`, 'no owner');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async getChildrenByNursery(nurseryId: number): Promise<Child[] | HttpException> {
        try {
            const NurseryInfo = await this.repo.findOne({ where: { id: nurseryId }, relations: ['children'] });
            if (NurseryInfo) {
                return NurseryInfo.children;
            }
        } catch (err) {
            this.generateError(`Cette crèche n'existe pas.`, 'no nurseryId');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }
}
